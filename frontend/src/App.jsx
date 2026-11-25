import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { Loading } from './ui.jsx'
import AuthShell from './shells/AuthShell.jsx'
import UserShell from './shells/UserShell.jsx'
import AdminShell from './shells/AdminShell.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Home from './pages/Home.jsx'
import Listings from './pages/Listings.jsx'
import SubmitItem from './pages/SubmitItem.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import MyListings from './pages/MyListings.jsx'
import { Dashboard, AdminListings, AdminUsers } from './pages/Admin.jsx'

function Protected({ children, admin }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (admin && !user.is_admin) return <Navigate to="/" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const titles = { '/': 'Home', '/lost': 'Lost Items', '/found': 'Found Items', '/my-listings': 'My Listings', '/login': 'Sign In', '/register': 'Create Account' }
    const t = titles[pathname] || (pathname.startsWith('/admin') ? 'Admin' : pathname.startsWith('/submit') ? 'Post an Item' : pathname.startsWith('/listing') ? 'Item Details' : '')
    document.title = t ? `${t} · Lost & Found Pakistan` : 'Lost & Found Pakistan'
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<AuthShell />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>
      <Route element={<Protected><UserShell /></Protected>}>
        <Route path="/" element={<Home />} />
        <Route path="/lost" element={<Listings type="lost" />} />
        <Route path="/found" element={<Listings type="found" />} />
        <Route path="/submit/:type" element={<SubmitItem />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/my-listings" element={<MyListings />} />
      </Route>
      <Route element={<Protected admin><AdminShell /></Protected>}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
