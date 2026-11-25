// Tailwind helpers for the admin panel (slightly different palette from the user portal).
const base = 'inline-flex cursor-pointer items-center gap-[5px] border font-semibold transition'
const variant = {
  primary: 'border-a-blue bg-a-blue text-white hover:bg-[#1a50b8]',
  outline: 'border-[#c3d8f8] bg-white text-a-blue hover:bg-a-blue-l',
  ghost: 'border-a-line bg-transparent text-a-mute hover:bg-a-bg hover:text-a-ink',
  ghostN: 'border-white/20 bg-transparent text-white/65 hover:bg-white/10 hover:text-white',
  danger: 'border-[#fecaca] bg-a-red-l text-a-red hover:bg-[#fecaca]',
}
const size = { md: 'rounded-[7px] px-3.5 py-[7px] text-xs', sm: 'rounded-[7px] px-2.5 py-[5px] text-[11px]' }
export const AB = (v = 'primary', s = 'md') => `${base} ${variant[v]} ${size[s]}`

export const Page = ({ children }) => <div className="mx-auto w-full max-w-[1280px] px-4 pb-[60px] pt-6 sm:px-7">{children}</div>
export const Header = ({ title, sub, children }) => (
  <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-a-line bg-white px-[22px] py-4 shadow-[0_1px_4px_rgba(15,42,94,.08)]">
    <div><div className="text-xl font-extrabold tracking-[-.3px]">{title}</div><div className="mt-[3px] text-xs text-a-mute">{sub}</div></div>
    {children}
  </div>
)
export const Card = ({ title, action, children }) => (
  <div className="mb-[18px] overflow-hidden rounded-[10px] border border-a-line bg-white shadow-[0_1px_4px_rgba(15,42,94,.08)]">
    <div className="flex items-center justify-between gap-2 border-b border-a-line bg-[#fafcff] px-5 py-[13px]">
      <div className="text-[13.5px] font-bold">{title}</div>{action}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
)
export const Table = ({ head, children }) => (
  <table className="w-full border-collapse text-[13px]">
    <thead className="border-b-2 border-a-line bg-[#f8fafc]">
      <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[.4px] text-a-mute">{h}</th>)}</tr>
    </thead>
    <tbody className="[&_tr:hover]:bg-[#f7faff] [&_tr:last-child_td]:border-b-0">{children}</tbody>
  </table>
)
export const td = 'border-b border-a-line-l px-3.5 py-[9px] align-middle'

const badge = {
  green: 'border-[#bbf7d0] bg-ok-l text-ok', red: 'border-[#fecaca] bg-a-red-l text-a-red',
  blue: 'border-[#c3d8f8] bg-a-blue-l text-a-blue', amber: 'border-[#fde68a] bg-warn-l text-warn',
  grey: 'border-[#e2e8f0] bg-[#f1f5f9] text-a-mute',
}
export const Badge = ({ tone, children }) => <span className={`inline-block rounded-full border px-[9px] py-[3px] text-[11px] font-semibold ${badge[tone]}`}>{children}</span>
export const statusTone = { active: 'green', claimed: 'amber', delivered: 'blue', expired: 'grey' }
export const adminField = 'w-full rounded-[7px] border-[1.5px] border-a-line bg-white px-3 py-2 text-[13px] outline-none transition focus:border-a-blue focus:shadow-[0_0_0_3px_rgba(30,95,212,.1)]'
export const Load = () => <div className="p-10 text-center text-a-mute">Loading…</div>
