// Shared Tailwind class helpers and tiny components, so pages stay readable.

/* ---------- buttons (user portal) ---------- */
const btnBase = 'inline-flex cursor-pointer items-center gap-1.5 border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
const btnVariant = {
  primary: 'border-primary bg-primary text-white hover:-translate-y-px hover:bg-primary-d',
  success: 'border-ok bg-ok text-white hover:bg-green-700',
  danger: 'border-bad bg-bad text-white hover:bg-red-700',
  outline: 'border-[#c3d8f8] bg-white text-primary hover:bg-primary-l',
  ghost: 'border-line bg-transparent text-mute hover:bg-bg hover:text-ink',
  whatsapp: 'border-[#25D366] bg-[#25D366] font-bold text-white hover:bg-[#128C7E] hover:shadow-[0_4px_14px_rgba(37,211,102,.4)]',
}
const btnSize = {
  md: 'rounded-lg px-[18px] py-[9px] text-[13px]',
  sm: 'rounded-lg px-[13px] py-1.5 text-xs',
  lg: 'rounded-[10px] px-7 py-[13px] text-[15px]',
}
export const B = (variant = 'primary', size = 'md') => `${btnBase} ${btnVariant[variant]} ${btnSize[size]}`

/* ---------- form fields ---------- */
export const field = 'w-full rounded-lg border-[1.5px] border-line bg-bg px-[13px] py-2.5 text-[13px] text-ink outline-none transition placeholder:text-[#aab5cc] focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.1)]'
export const Field = ({ label, full, children }) => (
  <div className={`flex flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
    <label className="text-xs font-semibold tracking-[.1px] text-ink2">{label}</label>
    {children}
  </div>
)
export const Req = () => <span className="text-bad">*</span>

/* ---------- layout ---------- */
export const Main = ({ children, max = 'max-w-[1100px]' }) => (
  <div className={`mx-auto w-full ${max} px-3.5 pb-[60px] pt-5 sm:px-6 sm:pt-8`}>{children}</div>
)
export const PageHeader = ({ title, sub, children }) => (
  <div className="bg-linear-to-br from-navy to-navy2 px-4 py-9 sm:px-8">
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-1 text-[26px] font-extrabold tracking-[-.3px] text-white">{title}</div>
      <div className="text-[13px] text-white/55">{sub}</div>
      {children && <div className="mt-4 flex flex-wrap gap-5">{children}</div>}
    </div>
  </div>
)
export const HeaderStat = ({ n, label }) => (
  <div className="rounded-lg border border-white/15 bg-white/10 px-[18px] py-2.5">
    <div className="text-xl font-extrabold leading-none text-white">{n}</div>
    <div className="mt-0.5 text-[10px] uppercase tracking-[.4px] text-white/45">{label}</div>
  </div>
)
export const cardsGrid = 'mb-9 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3'
export const panel = 'rounded-xl border border-line bg-white shadow-card'

/* ---------- misc ---------- */
export const Empty = ({ icon, title, sub, children }) => (
  <div className="px-6 py-[60px] text-center text-mute">
    <div className="mb-3.5 text-5xl">{icon}</div>
    <div className="mb-1.5 text-lg font-bold text-ink2">{title}</div>
    <div className="mb-5 text-[13.5px]">{sub}</div>
    {children}
  </div>
)
export const Loading = () => <div className="py-[60px] text-center text-mute">Loading…</div>
export const Flash = ({ children, type = 'error' }) => {
  const c = { error: 'border-[#fecaca] bg-bad-l text-bad', warn: 'border-[#fde68a] bg-warn-l text-warn', ok: 'border-[#bbf7d0] bg-ok-l text-green-700' }[type]
  return children ? <div className={`mb-2.5 flex items-center gap-2.5 rounded-[9px] border px-4 py-3 text-[13.5px] ${c}`}>{children}</div> : null
}

const pill = {
  active: 'border-[#bbf7d0] bg-ok-l text-ok',
  claimed: 'border-[#fde68a] bg-warn-l text-warn',
  delivered: 'border-[#c3d8f8] bg-primary-l text-primary',
  expired: 'border-[#e2e8f0] bg-[#f1f5f9] text-mute',
}
export const StatusPill = ({ status, label }) => (
  <span className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold capitalize ${pill[status]}`}>{label || status}</span>
)
