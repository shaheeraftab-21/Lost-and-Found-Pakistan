import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { Flash } from '../ui.jsx'

const input = 'w-full rounded-[9px] border-[1.5px] border-line bg-[#f8faff] py-[11px] pl-3.5 pr-11 text-sm text-ink outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.1)]'
const Eye = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
)

function Field({ label, icon, hint, type, ...p }) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink2">{label}</label>
      <div className="relative">
        <input className={`${input} ${isPw ? '!pr-[76px]' : ''}`} type={isPw && show ? 'text' : type} {...p} required />
        <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-base text-mute">{icon}</span>
        {isPw && (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'}
            className="absolute right-[42px] top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-mute transition hover:text-primary">
            <Eye off={show} />
          </button>
        )}
      </div>
      {hint && <span className="mt-0.5 block text-[11px] text-[#9ca3af]">{hint}</span>}
    </div>
  )
}

export default function AuthPage({ mode }) {
  const { user, login, register } = useAuth()
  const loc = useLocation()
  const isReg = mode === 'register'
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (user) return <Navigate to={loc.state?.from || (user.is_admin ? '/admin' : '/')} replace />

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (isReg && f.password !== f.confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      if (isReg) await register(f)
      else await login(f.email, f.password)
    } catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-navy via-navy2 via-60% to-[#1a3d8a] p-6">
      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,.3)]">
        <div className="bg-navy px-8 py-7 text-center">
          <div className="mb-2 text-4xl">🔍</div>
          <div className="mb-[3px] text-lg font-extrabold text-white">Lost &amp; Found Pakistan</div>
          <div className="text-xs text-white/50">National Item Recovery Portal</div>
        </div>
        <div className="p-8">
          <Flash>{error}</Flash>
          <div className="mb-1 text-xl font-extrabold">{isReg ? 'Create Your Account' : 'Welcome Back'}</div>
          <div className="mb-6 text-[13px] text-mute">{isReg ? 'Join thousands of users across Pakistan' : 'Sign in to report or claim items'}</div>
          <form onSubmit={submit}>
            {isReg && <Field label="Full Name" icon="👤" type="text" placeholder="Muhammad Shaheer" value={f.full_name} onChange={set('full_name')} />}
            <Field label={isReg ? 'University / Work Email' : 'Email Address'} icon="📧" type="email" placeholder="your@email.com" value={f.email} onChange={set('email')} />
            {isReg && <Field label="Mobile Number (WhatsApp)" icon="📱" type="tel" placeholder="03001234567" hint="Used for WhatsApp contact when your item is claimed" value={f.phone} onChange={set('phone')} />}
            <Field label="Password" icon="🔒" type="password" placeholder={isReg ? 'At least 6 characters' : 'Your password'} minLength={isReg ? 6 : undefined} value={f.password} onChange={set('password')} />
            {isReg && <Field label="Confirm Password" icon="🔒" type="password" placeholder="Repeat password" value={f.confirm} onChange={set('confirm')} />}
            <button type="submit" disabled={busy} className="mt-1.5 w-full cursor-pointer rounded-[9px] bg-primary p-[13px] text-sm font-bold text-white transition hover:bg-primary-d hover:shadow-[0_4px_14px_rgba(26,86,219,.3)] disabled:opacity-60">
              {busy ? 'Please wait…' : isReg ? 'Create Account →' : 'Sign In →'}
            </button>
          </form>
          <div className="mt-5 text-center text-[13px] text-mute">
            {isReg ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isReg ? '/login' : '/register'} className="font-semibold text-primary hover:underline">{isReg ? 'Sign in here' : 'Create one here'}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
