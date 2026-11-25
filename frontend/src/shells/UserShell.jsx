import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const TICKER = 'Items can only be claimed within 15 days of posting. After 15 days, listings are automatically removed from the portal. Act fast to recover your items!'
const navLink = ({ isActive }) =>
  `hidden rounded-lg px-3.5 py-[7px] text-[13px] font-medium transition md:block ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
const ddItem = 'flex items-center gap-[9px] px-4 py-2.5 text-[13px] text-ink2 transition hover:bg-bg'
const mItem = ({ isActive }) =>
  `block border-b border-white/10 px-4 py-3.5 text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-white/85'}`

function Ticker() {
  const item = (
    <>
      <span className="mr-5 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-[3px] text-[11.5px] font-bold tracking-[.3px] text-white">⚠️ Important</span>
      <span className="mr-[60px] text-[12.5px] font-medium text-white">{TICKER}</span>
    </>
  )
  return (
    <div className="overflow-hidden bg-linear-to-r from-warn to-[#b45309] py-2">
      <div className="flex animate-ticker items-center whitespace-nowrap hover:[animation-play-state:paused]">{item}{item}</div>
    </div>
  )
}

export default function UserShell() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [pathname])
  const signOut = async (e) => { e.preventDefault(); await logout(); nav('/login') }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[500] bg-navy shadow-[0_2px_12px_rgba(0,0,0,.3)]">
        <nav className="flex h-[60px] items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-lg">🔍</div>
            <div>
              <div className="text-base font-bold tracking-[-.2px] text-white">Lost &amp; Found Pakistan</div>
              <div className="mt-px text-[10.5px] text-white/45">National Item Recovery Portal</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLink}>Home</NavLink>
            <NavLink to="/lost" className={navLink}>Lost Items</NavLink>
            <NavLink to="/found" className={navLink}>Found Items</NavLink>
            <NavLink to="/my-listings" className={navLink}>My Listings</NavLink>
            <Link to="/submit/lost" className="ml-2 rounded-lg bg-primary px-[18px] py-2 text-[13px] font-semibold text-white transition hover:-translate-y-px hover:bg-primary-d">+ Post Item</Link>
            <div className="group relative ml-1 flex cursor-pointer items-center gap-[9px] rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5">
              <div className="flex size-[26px] items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{user.full_name[0].toUpperCase()}</div>
              <span className="text-[12.5px] font-medium text-white/85">{user.full_name.split(' ')[0]}</span>
              <span className="text-white/85">▾</span>
              <div className="absolute right-0 top-full z-[600] hidden min-w-[180px] overflow-hidden rounded-lg border border-line bg-white shadow-lg group-hover:block">
                <Link to="/my-listings" className={ddItem}>📋 My Listings</Link>
                <Link to="/submit/lost" className={ddItem}>📍 Report Lost</Link>
                <Link to="/submit/found" className={ddItem}>✅ Report Found</Link>
                {user.is_admin && <Link to="/admin" className={ddItem}>🛡 Admin Panel</Link>}
                <div className="my-1 border-t border-line" />
                <a href="#logout" className={`${ddItem} !text-bad`} onClick={signOut}>🚪 Sign Out</a>
              </div>
            </div>
          </div>

          {/* phone / small tablet: hamburger */}
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}
            className="flex size-10 items-center justify-center rounded-lg border border-white/20 text-white md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </nav>

        {open && (
          <div className="max-h-[calc(100vh-60px)] overflow-y-auto border-t border-white/10 md:hidden">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{user.full_name[0].toUpperCase()}</div>
              <div className="min-w-0"><div className="truncate text-sm font-semibold text-white">{user.full_name}</div><div className="truncate text-xs text-white/50">{user.email}</div></div>
            </div>
            <NavLink to="/" end className={mItem}>🏠 Home</NavLink>
            <NavLink to="/lost" className={mItem}>📍 Lost Items</NavLink>
            <NavLink to="/found" className={mItem}>✅ Found Items</NavLink>
            <NavLink to="/my-listings" className={mItem}>📋 My Listings</NavLink>
            {user.is_admin && <NavLink to="/admin" className={mItem}>🛡 Admin Panel</NavLink>}
            <div className="grid grid-cols-2 gap-2.5 p-4">
              <Link to="/submit/lost" className="rounded-lg bg-primary py-2.5 text-center text-[13px] font-semibold text-white">+ Report Lost</Link>
              <Link to="/submit/found" className="rounded-lg bg-ok py-2.5 text-center text-[13px] font-semibold text-white">+ Report Found</Link>
            </div>
            <a href="#logout" onClick={signOut} className="block border-t border-white/10 px-4 py-3.5 text-sm font-medium text-red-300">🚪 Sign Out</a>
          </div>
        )}
      </header>
      <Ticker />
      <div className="flex-1"><Outlet /></div>
      <footer className="mt-auto bg-navy p-[18px] text-center text-xs text-white/50"><strong className="text-white/75">Lost &amp; Found Pakistan</strong> — National Item Recovery Portal · © 2026</footer>
    </div>
  )
}
