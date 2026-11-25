import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, imgUrl } from '../api'
import { Empty, Loading, Main, PageHeader, HeaderStat, StatusPill, B } from '../ui.jsx'
import { fmtDate } from '../constants'

export default function MyListings() {
  const [items, setItems] = useState(null)
  const load = () => api.get('/my-listings').then(setItems)
  useEffect(() => { load() }, [])
  const count = (s) => (items || []).filter((i) => i.status === s).length
  async function remove(id) { if (confirm('Delete this listing permanently?')) { await api.del(`/listings/${id}`); load() } }
  async function delivered(id) {
    if (confirm('Mark as delivered? This confirms the item was returned and removes it from active listings.')) { await api.post(`/listings/${id}/delivered`); load() }
  }

  return (
    <>
      <PageHeader title="📋 My Listings" sub="All items you have posted — lost and found reports">
        <HeaderStat n={count('active')} label="Active" /><HeaderStat n={count('claimed')} label="Claimed" />
        <HeaderStat n={count('delivered')} label="Delivered" /><HeaderStat n={items ? items.length : '–'} label="Total" />
      </PageHeader>
      <Main>
        <div className="mb-5 flex flex-wrap gap-2.5">
          <Link to="/submit/lost" className={B('danger')}>📍 Post Lost Item</Link>
          <Link to="/submit/found" className={B('success')}>✅ Post Found Item</Link>
        </div>
        {!items ? <Loading /> : items.length ? items.map((i) => {
          const lost = i.type === 'lost'
          return (
            <div key={i.id} className="mb-2.5 flex flex-wrap items-center gap-3.5 rounded-lg border border-line bg-white px-[18px] py-3.5 shadow-card transition hover:border-[#c3d8f8] hover:shadow-card-md">
              {i.images[0]
                ? <img src={imgUrl(i.images[0])} alt={i.title} className="size-14 shrink-0 rounded-lg object-cover" />
                : <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[22px]">{lost ? '📍' : '✅'}</div>}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{i.title}</div>
                <div className="mt-0.5 text-xs text-mute">
                  <span className={`mr-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${lost ? 'bg-bad-l text-bad' : 'bg-ok-l text-ok'}`}>{i.type.toUpperCase()}</span>
                  {i.city || '—'} · {fmtDate(i.created_at)}{i.status === 'active' && ` · ⏱ ${i.days_left}d left`}
                </div>
              </div>
              <StatusPill status={i.status} />
              <div className="flex shrink-0 gap-[7px]">
                <Link to={`/listing/${i.id}`} className={B('outline', 'sm')}>View</Link>
                {i.status === 'claimed' && <button className={B('success', 'sm')} onClick={() => delivered(i.id)}>✅ Delivered</button>}
                <button className={B('danger', 'sm')} onClick={() => remove(i.id)}>🗑</button>
              </div>
            </div>
          )
        }) : (
          <Empty icon="📋" title="No listings yet" sub="You haven't posted any lost or found items yet.">
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link to="/submit/lost" className={B('danger')}>📍 Report Lost Item</Link><Link to="/submit/found" className={B('success')}>✅ Report Found Item</Link>
            </div>
          </Empty>
        )}
      </Main>
    </>
  )
}
