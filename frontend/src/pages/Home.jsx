import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import ListingCard from '../components/ListingCard.jsx'
import { Empty, Loading, Main, cardsGrid, B } from '../ui.jsx'

const STEPS = [
  ['1', '📝', 'Post a Report', 'Describe your lost or found item with photos, location, and details.'],
  ['2', '🔔', 'Get Matched', 'Browse and search lost and found reports to spot your item quickly.'],
  ['3', '💬', 'Connect via WhatsApp', 'Claim the item and, once approved, chat with the owner on WhatsApp.'],
]
const quick = 'mb-2 flex cursor-pointer items-center gap-2.5 rounded-[9px] bg-white/[.08] px-3 py-2.5 text-[13px] font-medium text-white/85 transition last:mb-0 hover:bg-white/[.16] hover:text-white'

function Section({ title, to, items }) {
  if (!items.length) return null
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-[9px] text-lg font-bold before:inline-block before:h-5 before:w-1 before:rounded-sm before:bg-primary">{title}</div>
        <Link to={to} className="text-[13px] font-semibold text-primary hover:underline">View all →</Link>
      </div>
      <div className={cardsGrid}>{items.map((i) => <ListingCard key={i.id} item={i} />)}</div>
    </>
  )
}

export default function Home() {
  const [d, setD] = useState(null)
  useEffect(() => {
    Promise.all([api.get('/listings?type=lost'), api.get('/listings?type=found')]).then(([lost, found]) => setD({ lost, found }))
  }, [])
  const stat = (n, l) => <div><div className="text-[28px] font-extrabold leading-none text-white">{n}</div><div className="mt-[3px] text-[10.5px] uppercase tracking-[.4px] text-white/45">{l}</div></div>

  return (
    <>
      <div className="relative overflow-hidden bg-linear-to-br from-navy via-navy2 via-60% to-[#1a3d8a] px-4 pb-[52px] pt-14 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(26,86,219,.3)_0%,transparent_65%)]" />
        <div className="relative z-[1] mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 inline-flex items-center gap-[7px] rounded-full border border-white/[.18] bg-white/10 px-[15px] py-[5px] text-[11px] font-semibold uppercase tracking-[.5px] text-white/85">🇵🇰 Serving All Major Cities of Pakistan</div>
            <h1 className="mb-2.5 text-4xl font-extrabold leading-[1.15] tracking-[-.5px] text-white">Lost Something?<br /><em className="not-italic text-[#93c5fd]">We'll Help You Find It.</em></h1>
            <p className="mb-7 max-w-[480px] text-sm leading-[1.7] text-white/60">A centralized Lost &amp; Found portal for Pakistan. Report lost or found items, get matched, and connect instantly via WhatsApp. Free for everyone.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/submit/lost" className="flex items-center gap-2 rounded-[10px] bg-primary px-7 py-[13px] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-d hover:shadow-[0_6px_20px_rgba(26,86,219,.4)]">📍 Report Lost Item</Link>
              <Link to="/submit/found" className="rounded-[10px] border border-white/30 bg-white/10 px-7 py-[13px] text-sm font-semibold text-white transition hover:bg-white/[.18]">✅ Report Found Item</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-7">
              {stat(d ? d.lost.total : '–', 'Lost Reports')}{stat(d ? d.found.total : '–', 'Found Reports')}{stat('15', 'Days Claim Window')}{stat('10+', 'Cities Covered')}
            </div>
          </div>
          <div className="hidden min-w-[200px] rounded-xl border border-white/[.18] bg-white/10 p-[22px] backdrop-blur-sm md:block">
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[.5px] text-white/55">Quick Actions</div>
            <Link to="/submit/lost" className={quick}><span className="shrink-0 text-lg">📍</span>I lost something</Link>
            <Link to="/submit/found" className={quick}><span className="shrink-0 text-lg">✅</span>I found something</Link>
            <Link to="/lost" className={quick}><span className="shrink-0 text-lg">🔍</span>Browse lost items</Link>
            <Link to="/found" className={quick}><span className="shrink-0 text-lg">📦</span>Browse found items</Link>
            <Link to="/my-listings" className={quick}><span className="shrink-0 text-lg">📋</span>My listings</Link>
          </div>
        </div>
      </div>

      <Main>
        <div className="mb-8 rounded-xl border border-line bg-white px-5 py-7 shadow-card sm:px-8">
          <div className="mb-6 text-center"><div className="text-xl font-extrabold">How It Works</div><div className="mt-1 text-[13px] text-mute">Simple 3-step process to recover your items</div></div>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map(([n, icon, t, s]) => (
              <div key={n} className="rounded-[10px] border border-line-l bg-bg px-4 py-5 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white">{n}</div>
                <div className="mb-2 text-[22px]">{icon}</div>
                <div className="mb-[5px] text-sm font-bold">{t}</div>
                <div className="text-[12.5px] leading-[1.55] text-mute">{s}</div>
              </div>
            ))}
          </div>
        </div>
        {!d ? <Loading /> : (
          <>
            <Section title="Recent Lost Items" to="/lost" items={d.lost.items.slice(0, 6)} />
            <Section title="Recent Found Items" to="/found" items={d.found.items.slice(0, 6)} />
            {!d.lost.items.length && !d.found.items.length && (
              <Empty icon="📭" title="No listings yet" sub="Be the first to post a lost or found item!"><Link to="/submit/lost" className={B()}>Post a Listing</Link></Empty>
            )}
          </>
        )}
      </Main>
    </>
  )
}
