import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { fmtDate } from '../constants'
import { AB, Badge, Card, Header, Load, Page, Table, adminField, statusTone, td } from '../adminUi.jsx'

const typeTone = (t) => (t === 'lost' ? 'red' : 'green')
const mute = 'text-xs text-a-mute'

function ListingRows({ rows, onDelete, full }) {
  return rows.map((l, i) => (
    <tr key={l.id}>
      {full && <td className={`${td} text-[11px] text-a-mute`}>{i + 1}</td>}
      <td className={`${td} max-w-[200px] truncate`}><Link to={`/listing/${l.id}`} className="text-[13px] font-semibold text-a-blue">{l.title}</Link></td>
      <td className={td}><Badge tone={typeTone(l.type)}>{l.type}</Badge></td>
      {full && <td className={`${td} ${mute}`}>{l.category || '—'}</td>}
      <td className={`${td} text-xs`}>{l.city || '—'}</td>
      {full && <><td className={`${td} text-xs`}>{l.owner_name}</td><td className={`${td} text-[11.5px] text-a-mute`}>{fmtDate(l.created_at)}</td></>}
      <td className={td}><Badge tone={statusTone[l.status]}>{l.status}</Badge></td>
      {full && <td className={`${td} text-xs`}>{l.days_left}d</td>}
      <td className={td}><button className={AB('danger', 'sm')} onClick={() => onDelete(l)}>🗑{full && ' Delete'}</button></td>
    </tr>
  ))
}

const STAT_BAR = ['bg-a-blue', 'bg-a-red', 'bg-ok', 'bg-warn', 'bg-a-teal', 'bg-[#7c3aed]', 'bg-[#be185d]', 'bg-ok']

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [listings, setListings] = useState(null)
  const [users, setUsers] = useState(null)
  const load = () => { api.get('/admin/stats').then(setStats); api.get('/admin/listings').then(setListings); api.get('/admin/users').then(setUsers) }
  useEffect(load, [])
  async function del(l) { if (confirm('Delete?')) { await api.del(`/listings/${l.id}`); load() } }
  if (!stats || !listings || !users) return <Load />

  const cards = [['👥', 'Total Users', stats.users], ['📍', 'Lost Reports', stats.lost], ['✅', 'Found Reports', stats.found], ['🟢', 'Active Listings', stats.active],
    ['✋', 'Claimed', stats.claimed], ['📦', 'Delivered', stats.delivered], ['⏰', 'Expired', stats.expired], ['🔗', 'Total Claims', stats.claims]]
  return (
    <Page>
      <Header title="Admin Dashboard" sub="System overview — National Lost & Found Portal"><Link to="/admin/listings" className={AB('primary', 'sm')}>📋 Manage Listings</Link></Header>
      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map(([icon, label, v], i) => (
          <div key={label} className="relative overflow-hidden rounded-[10px] border border-a-line bg-white px-5 py-[18px] shadow-[0_1px_4px_rgba(15,42,94,.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(15,42,94,.1)]">
            <div className={`absolute inset-x-0 top-0 h-1 ${STAT_BAR[i]}`} />
            <div className="text-[28px] font-extrabold leading-none">{v}</div>
            <div className="mt-1 text-[11.5px] text-a-mute">{label}</div>
            <div className="absolute bottom-2.5 right-3.5 text-[28px] opacity-15">{icon}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Card title="📋 Recent Listings" action={<Link to="/admin/listings" className={AB('outline', 'sm')}>View All</Link>}>
          <Table head={['Title', 'Type', 'City', 'Status', '']}><ListingRows rows={listings.slice(0, 6)} onDelete={del} /></Table>
        </Card>
        <Card title="👥 Recent Users" action={<Link to="/admin/users" className={AB('outline', 'sm')}>View All</Link>}>
          <Table head={['Name', 'Email', 'Phone', 'Joined']}>
            {users.slice(0, 6).map((u) => (
              <tr key={u.id}><td className={`${td} font-semibold`}>{u.full_name}</td><td className={`${td} ${mute}`}>{u.email}</td><td className={`${td} ${mute}`}>{u.phone}</td><td className={`${td} ${mute}`}>{fmtDate(u.joined_date, { month: 'short', day: 'numeric' })}</td></tr>
            ))}
          </Table>
        </Card>
      </div>
    </Page>
  )
}

export function AdminListings() {
  const [rows, setRows] = useState(null)
  const [f, setF] = useState({ type: '', status: '', city: '' })
  const [applied, setApplied] = useState(f)
  const load = () => api.get('/admin/listings?' + new URLSearchParams(Object.entries({ type: applied.type, status: applied.status }).filter(([, v]) => v))).then(setRows)
  useEffect(() => { load() }, [applied.type, applied.status])
  async function del(l) { if (confirm(`Delete listing #${l.id}?`)) { await api.del(`/listings/${l.id}`); load() } }
  const shown = (rows || []).filter((l) => !applied.city || (l.city || '').toLowerCase().includes(applied.city.toLowerCase()))
  const Grp = ({ label, min, children }) => <div className={`flex flex-1 flex-col gap-1 ${min}`}><label className="text-[11px] font-bold uppercase tracking-[.3px] text-a-mute">{label}</label>{children}</div>

  return (
    <Page>
      <Header title="📋 All Listings" sub={`${rows ? shown.length : '–'} records — filter and manage all lost & found reports`} />
      <form className="mb-[18px] flex flex-wrap items-end gap-2.5 rounded-[10px] border border-a-line bg-white px-5 py-4 shadow-[0_1px_4px_rgba(15,42,94,.08)]" onSubmit={(e) => { e.preventDefault(); setApplied(f) }}>
        <Grp label="Type" min="min-w-[120px]"><select className={adminField} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="">All Types</option><option value="lost">Lost</option><option value="found">Found</option></select></Grp>
        <Grp label="Status" min="min-w-[120px]"><select className={adminField} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All Statuses</option>{['active', 'claimed', 'delivered', 'expired'].map((s) => <option key={s}>{s}</option>)}</select></Grp>
        <Grp label="City" min="min-w-[140px]"><input className={adminField} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Filter by city…" /></Grp>
        <button type="submit" className={AB('primary', 'sm')}>Filter</button>
        <button type="button" className={AB('ghost', 'sm')} onClick={() => { const e = { type: '', status: '', city: '' }; setF(e); setApplied(e) }}>Reset</button>
      </form>
      <Card title={`Results: ${shown.length} listing(s)`}>
        {!rows ? <Load /> : (
          <Table head={['#', 'Title', 'Type', 'Category', 'City', 'Posted By', 'Date', 'Status', 'Days Left', 'Action']}>
            <ListingRows rows={shown} onDelete={del} full />
            {!shown.length && <tr><td colSpan={10} className="p-10 text-center text-a-mute">No listings found.</td></tr>}
          </Table>
        )}
      </Card>
    </Page>
  )
}

export function AdminUsers() {
  const [users, setUsers] = useState(null)
  const load = () => api.get('/admin/users').then(setUsers)
  useEffect(() => { load() }, [])
  async function del(u) {
    if (!confirm(`Delete user ${u.full_name}? This cannot be undone.`)) return
    try { await api.del(`/admin/users/${u.id}`); load() } catch (e) { alert(e.message) }
  }
  return (
    <Page>
      <Header title="👥 Registered Users" sub={`${users ? users.length : '–'} total registered users`} />
      <Card title="All Users">
        {!users ? <Load /> : (
          <Table head={['#', 'Name', 'Email', 'Phone', 'Role', 'Joined', 'Action']}>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td className={`${td} text-[11px] text-a-mute`}>{i + 1}</td><td className={`${td} font-semibold`}>{u.full_name}</td>
                <td className={`${td} text-[12.5px] text-a-mute`}>{u.email}</td><td className={`${td} text-[12.5px]`}>{u.phone}</td>
                <td className={td}><Badge tone={u.is_admin ? 'amber' : 'blue'}>{u.is_admin ? 'Admin' : 'User'}</Badge></td>
                <td className={`${td} ${mute}`}>{fmtDate(u.joined_date)}</td>
                <td className={td}>{u.is_admin ? <span className="text-[11.5px] text-a-mute">Protected</span> : <button className={AB('danger', 'sm')} onClick={() => del(u)}>🗑 Delete</button>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </Page>
  )
}
