import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { AB } from '../adminUi.jsx'

const sn = ({ isActive }) =>
  `-mb-0.5 whitespace-nowrap border-b-2 px-[13px] py-[11px] text-[12.5px] transition ${isActive ? 'border-a-blue font-semibold text-a-blue' : 'border-transparent font-medium text-a-mute hover:text-a-blue'}`

export default function AdminShell() {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <div className="flex min-h-screen flex-col bg-a-bg text-a-ink">
      <div className="sticky top-0 z-[200] flex h-14 items-center justify-between bg-a-navy px-4 shadow-[0_2px_10px_rgba(0,0,0,.25)] sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex size-[34px] items-center justify-center rounded-lg bg-a-blue">🔍</div>
          <div><div className="text-[14.5px] font-bold text-white">Lost &amp; Found Pakistan — Admin</div><div className="text-[11px] text-white/45">National Item Recovery Portal</div></div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/listings" className={`${AB('outline', 'sm')} hidden sm:inline-flex`}>📋 Listings</Link>
          <Link to="/admin/users" className={`${AB('outline', 'sm')} hidden sm:inline-flex`}>👥 Users</Link>
          <Link to="/" className={AB('ghostN', 'sm')}>🌐 User Portal</Link>
          <a href="#logout" className={AB('ghostN', 'sm')} onClick={async (e) => { e.preventDefault(); await logout(); nav('/login') }}>🚪 Logout</a>
        </div>
      </div>
      <div className="flex items-center gap-0.5 overflow-x-auto border-b-2 border-a-line bg-white px-4 sm:px-7">
        <NavLink to="/admin" end className={sn}>🏠 Dashboard</NavLink>
        <NavLink to="/admin/listings" className={sn}>📋 Listings</NavLink>
        <NavLink to="/admin/users" className={sn}>👥 Users</NavLink>
        <Link to="/" className={sn({ isActive: false })}>🌐 User Portal</Link>
      </div>
      <div className="flex-1"><Outlet /></div>
      <footer className="mt-5 border-t border-a-line bg-white p-3.5 text-center text-[11px] text-a-mute">Lost &amp; Found Pakistan — Admin Panel · © 2026</footer>
    </div>
  )
}
