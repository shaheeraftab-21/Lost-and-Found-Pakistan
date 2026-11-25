import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import ListingCard from '../components/ListingCard.jsx'
import { Empty, Loading, Main, PageHeader, HeaderStat, cardsGrid, panel, B } from '../ui.jsx'
import { CATEGORIES } from '../constants'

const sf = 'rounded-lg border-[1.5px] border-line bg-bg px-[13px] py-[9px] text-[13px] text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.1)]'
const Group = ({ label, children }) => (
  <div className="flex min-w-[150px] flex-1 flex-col gap-[5px]">
    <label className="text-[11.5px] font-semibold uppercase tracking-[.3px] text-mute">{label}</label>{children}
  </div>
)

export default function Listings({ type }) {
  const isLost = type === 'lost'
  const [form, setForm] = useState({ q: '', category: '', city: '' })
  const [applied, setApplied] = useState(form)
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)

  useEffect(() => { const e = { q: '', category: '', city: '' }; setForm(e); setApplied(e); setPage(1) }, [type])
  useEffect(() => {
    setData(null)
    const p = new URLSearchParams({ type, page, ...Object.fromEntries(Object.entries(applied).filter(([, v]) => v)) })
    api.get('/listings?' + p).then(setData)
  }, [type, page, applied])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const filtered = applied.q || applied.category || applied.city

  return (
    <>
      <PageHeader title={isLost ? '📍 Lost Items' : '✅ Found Items'}
        sub={isLost ? 'Browse all reported lost items. Find yours or help someone else find theirs.' : 'Browse items that have been found. Claim yours or help return something to its owner.'}>
        <HeaderStat n={data ? data.total : '–'} label="Results" /><HeaderStat n="15" label="Days Claim Window" />
      </PageHeader>
      <Main>
        <div className={`${panel} mb-6 px-5 py-4`}>
          <form className="flex flex-wrap items-end gap-2.5" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(form) }}>
            <Group label="Search"><input className={sf} value={form.q} onChange={set('q')} placeholder="e.g. iPhone, wallet, keys…" /></Group>
            <Group label="Category">
              <select className={sf} value={form.category} onChange={set('category')}><option value="">All Categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Group>
            <Group label="City"><input className={sf} value={form.city} onChange={set('city')} placeholder="e.g. Lahore, Karachi…" /></Group>
            <button type="submit" className="flex cursor-pointer items-center gap-1.5 self-end whitespace-nowrap rounded-lg bg-primary px-[22px] py-2.5 text-[13px] font-bold text-white transition hover:bg-primary-d">🔍 Search</button>
          </form>
        </div>

        {!data ? <Loading /> : data.items.length ? (
          <>
            <div className={cardsGrid}>{data.items.map((i) => <ListingCard key={i.id} item={i} />)}</div>
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-3.5">
                <button className={B('outline')} disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button>
                <span className="text-[13px] text-mute">Page {data.page} of {data.pages}</span>
                <button className={B('outline')} disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            )}
          </>
        ) : (
          <Empty icon="🔍" title={`No ${type} items found`} sub={filtered ? 'Try adjusting your search filters.' : `No ${type} items posted yet.`}>
            <Link to={`/submit/${type}`} className={B()}>Report a {isLost ? 'Lost' : 'Found'} Item</Link>
          </Empty>
        )}
      </Main>
    </>
  )
}
