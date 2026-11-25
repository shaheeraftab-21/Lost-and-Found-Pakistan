import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, imgUrl } from '../api'
import { B, Flash, Loading, Main, StatusPill, panel } from '../ui.jsx'
import { categoryIcon, fmtDate, waLink } from '../constants'

const box = `${panel} mt-4 p-5`
const Attr = ({ label, value }) => value ? (
  <div className="rounded-lg border border-line-l bg-bg px-[13px] py-2.5">
    <div className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.3px] text-mute">{label}</div>
    <div className="text-[13px] font-semibold">{value}</div>
  </div>
) : null
const notice = {
  ok: 'border-[#bbf7d0] bg-ok-l text-ok', warn: 'border-[#fde68a] bg-warn-l text-warn', bad: 'border-[#fecaca] bg-bad-l text-bad',
}
const Notice = ({ tone, children }) => <div className={`mb-3 rounded-[9px] border p-3 text-center text-[13px] font-semibold ${notice[tone]}`}>{children}</div>
const typeBadge = (t) => t === 'lost' ? 'bg-bad' : 'bg-ok'

export default function ListingDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [l, setL] = useState(null)
  const [error, setError] = useState('')
  const [img, setImg] = useState(0)
  const [msg, setMsg] = useState('')
  const [contact, setContact] = useState(null)
  const [claims, setClaims] = useState([])
  const [copied, setCopied] = useState(false)

  const load = () => api.get(`/listings/${id}`).then(setL).catch((e) => setError(e.message))
  useEffect(() => { setL(null); setContact(null); setImg(0); load() }, [id])
  useEffect(() => {
    if (!l) return
    if (l.is_owner) api.get(`/listings/${id}/claims`).then(setClaims)
    if (l.my_claim?.status === 'approved') api.get(`/listings/${id}/contact`).then(setContact)
  }, [l])

  if (error && !l) return <Main><Flash>{error}</Flash></Main>
  if (!l) return <Loading />
  const isLost = l.type === 'lost'
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setError('Could not copy the link.') }
  }
  const act = async (fn) => { setError(''); try { await fn(); load() } catch (e) { setError(e.message) } }

  return (
    <Main max="max-w-[1060px]">
      <div className="mb-[18px] flex items-center gap-[7px] text-[12.5px] text-mute">
        <Link to="/">Home</Link><span>›</span><Link to={isLost ? '/lost' : '/found'}>{isLost ? 'Lost Items' : 'Found Items'}</Link><span>›</span>
        <span className="font-medium text-ink">{l.title.slice(0, 50)}</span>
      </div>
      {l.days_left <= 3 && l.status === 'active' && (
        <div className="mb-4 rounded-[9px] border border-[#fecaca] bg-bad-l px-4 py-3 text-[13px] font-medium text-bad">🚨 <strong>Urgent:</strong> This listing expires in {l.days_left} day(s). Claim it now before it's removed!</div>
      )}
      <Flash>{error}</Flash>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className={`${panel} overflow-hidden`}>
            {l.images.length ? (
              <>
                <img src={imgUrl(l.images[img])} alt={l.title} className="h-80 w-full object-cover" />
                {l.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {l.images.map((n, i) => <img key={n} src={imgUrl(n)} alt={`Photo ${i + 1}`} onClick={() => setImg(i)} className={`size-[70px] shrink-0 cursor-pointer rounded-[7px] border-2 object-cover transition ${i === img ? 'border-primary' : 'border-transparent hover:border-primary'}`} />)}
                  </div>
                )}
              </>
            ) : <div className="flex h-80 items-center justify-center bg-[#f1f5f9] text-7xl">{categoryIcon(l.category)}</div>}
          </div>

          {l.description && (
            <div className={box}>
              <div className="mb-2.5 text-sm font-bold">📝 Description</div>
              <div className="rounded-lg border border-line-l bg-bg p-3.5 text-[13.5px] leading-[1.7] text-ink2">{l.description}</div>
            </div>
          )}

          {l.is_owner && claims.length > 0 && (
            <div className={box}>
              <div className="mb-3.5 text-sm font-bold">✋ Claims on this listing ({claims.length})</div>
              {claims.map((c) => (
                <div key={c.id} className="mb-2.5 flex flex-wrap items-center gap-3 rounded-[9px] border border-line-l bg-bg px-[15px] py-[13px]">
                  <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white">{c.claimant_name[0].toUpperCase()}</div>
                  <div className="min-w-[180px] flex-1">
                    <div className="text-[13px] font-bold">{c.claimant_name} <StatusPill status={c.status === 'approved' ? 'claimed' : c.status === 'rejected' ? 'expired' : 'active'} label={c.status} /></div>
                    <div className="text-[11.5px] text-mute">{fmtDate(c.claimed_at, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                    {c.message && <div className="mt-1 text-[12.5px] text-ink2">{c.message}</div>}
                  </div>
                  {c.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button className={B('success', 'sm')} onClick={() => act(() => api.post(`/claims/${c.id}/approve`))}>✔ Approve</button>
                      <button className={B('outline', 'sm')} onClick={() => act(() => api.post(`/claims/${c.id}/reject`))}>✖ Reject</button>
                    </div>
                  )}
                  {c.claimant_phone && <a className={B('success', 'sm')} target="_blank" rel="noreferrer" href={waLink(c.claimant_phone, `Hi ${c.claimant_name}, I saw your claim on my Lost & Found listing "${l.title}".`)}>💬 WhatsApp</a>}
                </div>
              ))}
              {l.status === 'claimed' && (
                <button className={`${B('primary')} mt-2.5 w-full justify-center`} onClick={() => confirm('Mark this item as delivered? It will be removed from active listings.') && act(() => api.post(`/listings/${id}/delivered`))}>✅ Mark as Delivered — Item Returned</button>
              )}
            </div>
          )}
        </div>

        <div className={`${panel} p-[22px]`}>
          <span className={`mb-3.5 inline-block rounded-full px-3.5 py-[5px] text-xs font-bold uppercase tracking-[.4px] text-white ${typeBadge(l.type)}`}>{l.type}</span>
          {l.status === 'claimed' && <span className="ml-1.5 rounded-full border border-[#fde68a] bg-warn-l px-3.5 py-[5px] text-xs font-bold uppercase text-warn">Claimed</span>}
          {l.status === 'delivered' && <span className="ml-1.5 rounded-full border border-[#bbf7d0] bg-ok-l px-3.5 py-[5px] text-xs font-bold uppercase text-ok">Delivered ✓</span>}
          <div className="mb-2.5 text-[22px] font-extrabold leading-tight">{l.title}</div>
          {l.city && <div className="mb-4 flex items-center gap-1.5 text-[13px] text-mute">📍 {l.specific_location}{l.specific_location && ', '}{l.city}</div>}
          <div className="mb-4 flex items-center gap-2.5 rounded-[9px] border border-[#fde68a] bg-warn-l px-3.5 py-3 text-[12.5px] font-medium text-warn">⏱ <span><strong>{l.days_left} days</strong> remaining to claim{l.expires_at && ` · Expires ${fmtDate(l.expires_at)}`}</span></div>

          <div className="mb-[18px] grid grid-cols-2 gap-2.5">
            <Attr label={isLost ? 'Date Lost' : 'Date Found'} value={l.lost_date} /><Attr label="Category" value={l.category} />
            <Attr label="Sub-Category" value={l.subcategory} /><Attr label="Brand" value={l.brand} />
            <Attr label="Primary Colour" value={l.primary_color} /><Attr label="Secondary Colour" value={l.secondary_color} />
            <Attr label="Province" value={l.state} /><Attr label="Venue" value={l.venue} />
            <div className="col-span-2"><Attr label="Address" value={l.address} /></div>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-[9px] border border-[#c3d8f8] bg-[#f8faff] p-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{l.owner_name[0].toUpperCase()}</div>
            <div><div className="text-sm font-bold">{l.owner_name}</div><div className="text-[11.5px] text-mute">Posted {fmtDate(l.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
          </div>

          {l.is_owner ? (
            <>
              <Notice tone="ok">✅ This is your listing</Notice>
              <button className={`${B('danger')} w-full justify-center`} onClick={async () => { if (confirm('Delete this listing permanently?')) { await api.del(`/listings/${id}`); nav('/my-listings') } }}>🗑 Delete Listing</button>
            </>
          ) : l.status === 'delivered' ? (
            <div className="rounded-[9px] border border-[#bbf7d0] bg-ok-l p-4 text-center text-sm font-bold text-ok">✅ This item has been delivered to its owner.</div>
          ) : l.my_claim ? (
            <>
              {l.my_claim.status === 'pending' && <Notice tone="warn">⏳ Claim sent — waiting for the owner to review it</Notice>}
              {l.my_claim.status === 'rejected' && <Notice tone="bad">The owner did not approve this claim.</Notice>}
              {l.my_claim.status === 'approved' && (
                <>
                  <Notice tone="ok">✅ Claim approved — you can contact the owner</Notice>
                  {contact && <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" className={`${B('whatsapp', 'lg')} w-full justify-center`}>💬 Chat on WhatsApp ({contact.phone})</a>}
                </>
              )}
            </>
          ) : l.status === 'active' ? (
            <form onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post(`/listings/${id}/claim`, { message: msg }); setMsg('') }) }}>
              <label className="mb-1.5 block text-xs font-semibold text-ink2">Message to owner</label>
              <textarea rows={2} required value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Describe how you can prove ownership…" className="mb-3 w-full resize-none rounded-lg border-[1.5px] border-line bg-bg px-3 py-[9px] text-[13px] outline-none focus:border-primary" />
              <button type="submit" className={`${B('primary', 'lg')} w-full justify-center`}>✋ Claim This Item</button>
            </form>
          ) : <div className="rounded-[9px] border border-line bg-bg p-4 text-center text-[13px] text-mute">This listing is no longer available for claiming.</div>}

          <div className="mt-3.5 border-t border-line-l pt-3.5 text-center">
            <div className="mb-2 text-xs text-mute">Share this listing with someone who might know about it</div>
            <button type="button" onClick={copyLink} className={B('outline', 'sm')}>{copied ? '✅ Link copied!' : '🔗 Copy link'}</button>
          </div>
        </div>
      </div>
    </Main>
  )
}
