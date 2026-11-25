import os, json, time, secrets
from collections import defaultdict
from datetime import datetime, timedelta
from functools import wraps
from urllib.parse import quote
from flask import Flask, request, jsonify, abort, send_from_directory, Response
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_sqlalchemy import SQLAlchemy
from flask_login import (LoginManager, UserMixin, login_user, logout_user,
                         login_required, current_user)
from werkzeug.security import generate_password_hash, check_password_hash
import io
from PIL import Image as PILImage

BASE = os.path.dirname(os.path.abspath(__file__))
PROD = bool(os.environ.get('RENDER') or os.environ.get('PRODUCTION') == '1')
# Folder holding the built React app (created by the Dockerfile, or `npm run build` locally)
FRONTEND_DIST = os.environ.get('FRONTEND_DIST') or os.path.join(BASE, '..', 'frontend', 'dist')

secret = os.environ.get('SECRET_KEY')
if PROD and not secret:
    raise RuntimeError('SECRET_KEY environment variable is required in production.')

db_url = os.environ.get('DATABASE_URL', 'sqlite:///lostfound.db')
# Hosts hand out postgres:// or postgresql:// URLs. Name the driver explicitly so the
# result does not depend on which SQLAlchemy version pip installs (we ship psycopg2).
for prefix in ('postgres://', 'postgresql://'):
    if db_url.startswith(prefix):
        db_url = 'postgresql+psycopg2://' + db_url[len(prefix):]
        break

app = Flask(__name__, static_folder=None)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.config.update(
    SECRET_KEY=secret or 'dev-only-change-me',
    SQLALCHEMY_DATABASE_URI=db_url,
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ENGINE_OPTIONS={'pool_pre_ping': True},
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    SESSION_COOKIE_SAMESITE='Lax',   # blocks cross-site POSTs (CSRF)
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=os.environ.get('COOKIE_SECURE', '1' if PROD else '0') == '1',  # HTTPS-only cookie in production
)
EXPIRY_DAYS = 15
db = SQLAlchemy(app)
login_manager = LoginManager(app)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    joined_date = db.Column(db.DateTime, default=datetime.utcnow)


class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    listing_type = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80))
    brand = db.Column(db.String(80))
    primary_color = db.Column(db.String(40))
    description = db.Column(db.Text)
    city = db.Column(db.String(80))
    venue = db.Column(db.String(120))
    specific_location = db.Column(db.String(255))
    lost_date = db.Column(db.String(20))
    subcategory = db.Column(db.String(80))
    secondary_color = db.Column(db.String(40))
    state = db.Column(db.String(60))
    address = db.Column(db.String(255))
    images = db.Column(db.Text, default='[]')
    status = db.Column(db.String(20), default='active')  # active|claimed|delivered|expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    owner = db.relationship('User')

    def to_dict(self, detail=False):
        d = dict(id=self.id, type=self.listing_type, title=self.title,
                 category=self.category, city=self.city, status=self.status,
                 brand=self.brand, primary_color=self.primary_color,
                 venue=self.venue, lost_date=self.lost_date,
                 images=json.loads(self.images or '[]'),
                 created_at=self.created_at.isoformat(),
                 days_left=max(0, (self.expires_at - datetime.utcnow()).days) if self.expires_at else 0,
                 owner_name=self.owner.full_name if self.owner else 'Deleted user')
        if detail:
            d.update(description=self.description, specific_location=self.specific_location,
                     subcategory=self.subcategory, secondary_color=self.secondary_color,
                     state=self.state, address=self.address, owner_id=self.user_id,
                     expires_at=self.expires_at.isoformat() if self.expires_at else None)
        return d


class Claim(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    claimant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending|approved|rejected
    claimed_at = db.Column(db.DateTime, default=datetime.utcnow)
    claimant = db.relationship('User')

    def to_dict(self):
        d = dict(id=self.id, listing_id=self.listing_id, message=self.message,
                 status=self.status, claimant_name=self.claimant.full_name,
                 claimed_at=self.claimed_at.isoformat())
        if self.status == 'approved':  # phone shared with the owner only after approval
            d['claimant_phone'] = self.claimant.phone
        return d


class Image(db.Model):
    """Photos live in the database so they survive hosts with a temporary filesystem."""
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.LargeBinary, nullable=False)


@login_manager.user_loader
def load_user(uid): return db.session.get(User, int(uid))

@login_manager.unauthorized_handler
def unauth(): return jsonify(error='Login required'), 401

def admin_required(f):
    @wraps(f)
    @login_required
    def inner(*a, **k):
        if not current_user.is_admin: abort(403)
        return f(*a, **k)
    return inner

@app.errorhandler(403)
def e403(e): return jsonify(error='Forbidden'), 403
@app.errorhandler(404)
def e404(e): return jsonify(error='Not found'), 404
@app.errorhandler(405)
def e405(e): return jsonify(error='Method not allowed'), 405
@app.errorhandler(413)
def e413(e): return jsonify(error='Upload too large (max 16 MB).'), 413

def user_dict(u):
    return dict(id=u.id, full_name=u.full_name, email=u.email, phone=u.phone,
                is_admin=u.is_admin, joined_date=u.joined_date.isoformat())

def expire_old():
    for l in Listing.query.filter(Listing.expires_at < datetime.utcnow(), Listing.status == 'active'):
        l.status = 'expired'
    db.session.commit()

def save_images(files):
    """Validate, resize and store up to 4 photos. Returns the new image ids."""
    ids = []
    for f in files[:4]:
        if not f or not f.filename: continue
        try:
            img = PILImage.open(f.stream)
            img.verify(); f.stream.seek(0)
            img = PILImage.open(f.stream)
            if img.format not in ('PNG', 'JPEG', 'WEBP'): continue
            img = img.convert('RGB')
            img.thumbnail((1280, 1280))
            buf = io.BytesIO()
            img.save(buf, 'JPEG', quality=82, optimize=True)  # re-encoding also strips metadata
        except Exception:
            continue
        row = Image(data=buf.getvalue())
        db.session.add(row); db.session.flush()
        ids.append(row.id)
    return ids

def rm_images(listing):
    ids = json.loads(listing.images or '[]')
    if ids: Image.query.filter(Image.id.in_(ids)).delete(synchronize_session=False)


# ---------- auth ----------
_fails = defaultdict(list)   # (ip, email) -> timestamps of recent failed logins
MAX_FAILS, WINDOW = 5, 600

def too_many_attempts(key):
    now = time.time()
    _fails[key] = [t for t in _fails[key] if now - t < WINDOW]
    return len(_fails[key]) >= MAX_FAILS

@app.post('/api/auth/register')
def register():
    d = request.get_json(silent=True) or {}
    name, email = d.get('full_name', '').strip(), d.get('email', '').strip().lower()
    phone, pw = d.get('phone', '').strip(), d.get('password', '')
    if not all([name, email, phone, pw]) or '@' not in email:
        return jsonify(error='All fields are required and email must be valid.'), 400
    if len(pw) < 6: return jsonify(error='Password must be at least 6 characters.'), 400
    if User.query.filter_by(email=email).first():
        return jsonify(error='Email already registered.'), 409
    u = User(full_name=name, email=email, phone=phone, password_hash=generate_password_hash(pw))
    db.session.add(u); db.session.commit(); login_user(u)
    return jsonify(user_dict(u)), 201

@app.post('/api/auth/login')
def login():
    d = request.get_json(silent=True) or {}
    email = d.get('email', '').strip().lower()
    key = (request.remote_addr, email)
    if too_many_attempts(key):
        return jsonify(error='Too many failed attempts. Please try again in 10 minutes.'), 429
    u = User.query.filter_by(email=email).first()
    if not u or not check_password_hash(u.password_hash, d.get('password', '')):
        _fails[key].append(time.time())
        return jsonify(error='Invalid email or password.'), 401
    _fails.pop(key, None)
    login_user(u, remember=True)
    return jsonify(user_dict(u))

@app.post('/api/auth/logout')
@login_required
def logout():
    logout_user(); return jsonify(ok=True)

@app.get('/api/auth/me')
def me():
    return jsonify(user_dict(current_user) if current_user.is_authenticated else None)


# ---------- listings ----------
@app.get('/api/listings')
@login_required
def list_listings():
    expire_old()
    q = Listing.query.filter_by(status='active')
    t = request.args.get('type')
    if t in ('lost', 'found'): q = q.filter_by(listing_type=t)
    if request.args.get('q'): q = q.filter(Listing.title.ilike(f"%{request.args['q'].strip()}%"))
    if request.args.get('category'): q = q.filter_by(category=request.args['category'])
    if request.args.get('city'): q = q.filter(Listing.city.ilike(f"%{request.args['city'].strip()}%"))
    page = max(1, request.args.get('page', 1, type=int))
    p = q.order_by(Listing.created_at.desc()).paginate(page=page, per_page=12, error_out=False)
    return jsonify(items=[l.to_dict() for l in p.items], page=p.page, pages=p.pages, total=p.total)

@app.get('/api/listings/<int:lid>')
@login_required
def get_listing(lid):
    l = db.get_or_404(Listing, lid)
    d = l.to_dict(detail=True)
    mine = Claim.query.filter_by(listing_id=lid, claimant_id=current_user.id).first()
    d['my_claim'] = mine.to_dict() if mine else None
    d['is_owner'] = l.user_id == current_user.id
    return jsonify(d)

@app.post('/api/listings')
@login_required
def create_listing():
    f = request.form
    t, title = f.get('type'), f.get('title', '').strip()
    if t not in ('lost', 'found') or not title:
        return jsonify(error='Type and title are required.'), 400
    l = Listing(user_id=current_user.id, listing_type=t, title=title,
                category=f.get('category', ''), brand=f.get('brand', ''),
                primary_color=f.get('primary_color', ''), description=f.get('description', ''),
                city=f.get('city', ''), venue=f.get('venue', ''),
                specific_location=f.get('specific_location', ''), lost_date=f.get('lost_date', ''),
                subcategory=f.get('subcategory', ''), secondary_color=f.get('secondary_color', ''),
                state=f.get('state', ''), address=f.get('address', ''),
                images=json.dumps(save_images(request.files.getlist('images'))),
                expires_at=datetime.utcnow() + timedelta(days=EXPIRY_DAYS))
    db.session.add(l); db.session.commit()
    return jsonify(l.to_dict(detail=True)), 201

@app.get('/api/my-listings')
@login_required
def my_listings():
    expire_old()
    ls = Listing.query.filter_by(user_id=current_user.id).order_by(Listing.created_at.desc())
    return jsonify([l.to_dict() for l in ls])

@app.post('/api/listings/<int:lid>/delivered')
@login_required
def delivered(lid):
    l = db.get_or_404(Listing, lid)
    if l.user_id != current_user.id: abort(403)
    l.status = 'delivered'; db.session.commit()
    return jsonify(l.to_dict())

@app.delete('/api/listings/<int:lid>')
@login_required
def delete_listing(lid):
    l = db.get_or_404(Listing, lid)
    if l.user_id != current_user.id and not current_user.is_admin: abort(403)
    Claim.query.filter_by(listing_id=lid).delete()
    rm_images(l); db.session.delete(l); db.session.commit()
    return jsonify(ok=True)


# ---------- claims (owner approves before contact is revealed) ----------
@app.post('/api/listings/<int:lid>/claim')
@login_required
def claim(lid):
    l = db.get_or_404(Listing, lid)
    if l.user_id == current_user.id: return jsonify(error='You cannot claim your own listing.'), 400
    if l.status != 'active': return jsonify(error='This listing is no longer active.'), 400
    if Claim.query.filter_by(listing_id=lid, claimant_id=current_user.id).first():
        return jsonify(error='You already submitted a claim.'), 409
    msg = (request.get_json(silent=True) or {}).get('message', '').strip()
    if not msg: return jsonify(error='Describe how you can prove this item is yours.'), 400
    c = Claim(listing_id=lid, claimant_id=current_user.id, message=msg)
    db.session.add(c); db.session.commit()
    return jsonify(c.to_dict()), 201

@app.get('/api/listings/<int:lid>/claims')
@login_required
def listing_claims(lid):
    l = db.get_or_404(Listing, lid)
    if l.user_id != current_user.id: abort(403)
    return jsonify([c.to_dict() for c in Claim.query.filter_by(listing_id=lid)])

@app.post('/api/claims/<int:cid>/<action>')
@login_required
def decide_claim(cid, action):
    if action not in ('approve', 'reject'): abort(404)
    c = db.get_or_404(Claim, cid)
    l = db.session.get(Listing, c.listing_id)
    if l.user_id != current_user.id: abort(403)
    c.status = 'approved' if action == 'approve' else 'rejected'
    if action == 'approve': l.status = 'claimed'
    db.session.commit()
    return jsonify(c.to_dict())

@app.get('/api/listings/<int:lid>/contact')
@login_required
def contact(lid):
    l = db.get_or_404(Listing, lid)
    ok = Claim.query.filter_by(listing_id=lid, claimant_id=current_user.id, status='approved').first()
    if l.user_id != current_user.id and not ok: abort(403)
    if not l.owner: abort(404)
    phone = l.owner.phone.replace(' ', '').replace('-', '').replace('+', '')
    if phone.startswith('0'): phone = '92' + phone[1:]
    text = quote(f'Hi, I am contacting you about "{l.title}" on the Lost & Found portal.')
    return jsonify(name=l.owner.full_name, phone=l.owner.phone,
                   whatsapp_url=f'https://wa.me/{phone}?text={text}')


# ---------- admin ----------
@app.get('/api/admin/stats')
@admin_required
def admin_stats():
    expire_old()
    c = lambda **k: Listing.query.filter_by(**k).count()
    return jsonify(users=User.query.count(), lost=c(listing_type='lost'), found=c(listing_type='found'),
                   active=c(status='active'), claimed=c(status='claimed'),
                   delivered=c(status='delivered'), expired=c(status='expired'),
                   claims=Claim.query.count())

@app.get('/api/admin/listings')
@admin_required
def admin_listings():
    q = Listing.query
    for k, col in (('type', Listing.listing_type), ('status', Listing.status)):
        if request.args.get(k): q = q.filter(col == request.args[k])
    return jsonify([l.to_dict() for l in q.order_by(Listing.created_at.desc())])

@app.get('/api/admin/users')
@admin_required
def admin_users():
    return jsonify([user_dict(u) for u in User.query.order_by(User.joined_date.desc())])

@app.delete('/api/admin/users/<int:uid>')
@admin_required
def admin_delete_user(uid):
    u = db.get_or_404(User, uid)
    if u.id == current_user.id: return jsonify(error='You cannot delete yourself.'), 400
    for l in Listing.query.filter_by(user_id=uid).all():
        Claim.query.filter_by(listing_id=l.id).delete(); rm_images(l); db.session.delete(l)
    Claim.query.filter_by(claimant_id=uid).delete()
    db.session.delete(u); db.session.commit()
    return jsonify(ok=True)


# ---------- images, health, and the React app ----------
@app.get('/api/images/<int:iid>')
@login_required
def get_image(iid):
    img = db.get_or_404(Image, iid)
    return Response(img.data, mimetype='image/jpeg', headers={'Cache-Control': 'private, max-age=31536000, immutable'})

@app.get('/api/health')
def health():
    return jsonify(status='ok')

@app.get('/', defaults={'path': ''})
@app.get('/<path:path>')
def spa(path):
    if path.startswith('api/'): abort(404)
    dist = os.path.abspath(FRONTEND_DIST)
    target = os.path.join(dist, path)
    if path and os.path.isfile(target) and os.path.abspath(target).startswith(dist):
        return send_from_directory(dist, path)
    if not os.path.isfile(os.path.join(dist, 'index.html')):
        return jsonify(error='Frontend not built. Run `npm run build` in /frontend.'), 404
    return send_from_directory(dist, 'index.html')


with app.app_context():
    db.create_all()
    if not User.query.filter_by(is_admin=True).first():
        pw = os.environ.get('ADMIN_PASSWORD') or (secrets.token_urlsafe(10) if PROD else 'admin123')
        if PROD and not os.environ.get('ADMIN_PASSWORD'):
            print(f'*** Admin account created. One-time password: {pw} ***', flush=True)
        db.session.add(User(full_name='Admin', email=os.environ.get('ADMIN_EMAIL', 'admin@lostandfound.pk'),
                            phone='03000000000', is_admin=True, password_hash=generate_password_hash(pw)))
        db.session.commit()

if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', 5000)), debug=os.environ.get('FLASK_DEBUG') == '1')
