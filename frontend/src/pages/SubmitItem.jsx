import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { CATEGORIES, SUBCATS, COLORS, PROVINCES, CITIES_BY_PROVINCE } from '../constants'
import { B, Field, Flash, Main, PageHeader, Req, field } from '../ui.jsx'

const EMPTY = { title: '', lost_date: '', category: '', subcategory: '', brand: '', primary_color: '', secondary_color: '', description: '', specific_location: '', address: '', state: '', city: '' }
const Section = ({ title, sub, first, children }) => (
  <>
    <div className={`border-b border-line bg-[#fafcff] px-6 py-[18px] ${first ? '' : 'border-t'}`}>
      <div className="text-base font-bold">{title}</div><div className="mt-0.5 text-xs text-mute">{sub}</div>
    </div>
    <div className="p-6">{children}</div>
  </>
)
const grid = 'grid gap-[18px] sm:grid-cols-2'
const Opts = ({ list, ph }) => <><option value="">{ph}</option>{list.map((x) => <option key={x}>{x}</option>)}</>

export default function SubmitItem() {
  const { type } = useParams()
  const nav = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [files, setFiles] = useState([])
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const previews = useMemo(() => files.map((x) => URL.createObjectURL(x)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  if (!['lost', 'found'].includes(type)) return <Navigate to="/" replace />
  const isLost = type === 'lost'
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, ...(k === 'category' ? { subcategory: '' } : {}), ...(k === 'state' ? { city: '' } : {}) })
  const today = new Date().toISOString().split('T')[0]
  const pick = (list) => setFiles([...list].filter((x) => x.type.startsWith('image/')).slice(0, 4))

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const form = new FormData()
    form.append('type', type)
    Object.entries(f).forEach(([k, v]) => form.append(k, v))
    files.forEach((x) => form.append('images', x))
    try { nav(`/listing/${(await api.upload('/listings', form)).id}`) } catch (err) { setError(err.message); setBusy(false) }
  }

  const tab = (t, on, active, label) => (
    <Link to={`/submit/${t}`} className={`flex-1 rounded-[10px] border-2 p-3 text-center text-sm font-bold transition ${on ? active : 'border-line bg-white text-mute'}`}>{label}</Link>
  )

  return (
    <>
      <PageHeader title={isLost ? '📍 Report a Lost Item' : '✅ Report a Found Item'}
        sub={isLost ? 'Fill in as many details as possible to help others identify your item.' : 'Describe the item you found so the rightful owner can claim it.'} />
      <Main max="max-w-[860px]">
        <div className="mb-5 flex gap-2.5">
          {tab('lost', isLost, 'border-bad bg-bad-l text-bad', '📍 I Lost Something')}
          {tab('found', !isLost, 'border-ok bg-ok-l text-ok', '✅ I Found Something')}
        </div>
        <Flash>{error}</Flash>
        <form onSubmit={submit} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <Section first title={<>📷 Photos <span className="text-xs font-normal text-mute">(up to 4 photos)</span></>} sub="Clear photos significantly increase the chance of recovery">
            <label className={`block cursor-pointer rounded-lg border-2 border-dashed p-7 text-center transition hover:border-primary hover:bg-primary-l ${drag ? 'border-primary bg-primary-l' : 'border-line bg-bg'}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
              <div className="mb-2 text-[32px]">📷</div>
              <div className="mb-1 text-[13px] text-mute"><strong>Click to upload</strong> or drag &amp; drop photos here</div>
              <div className="text-[11.5px] text-[#aab5cc]">JPG, PNG, WEBP — Max 4 photos</div>
              {previews.length > 0 && <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">{previews.map((s) => <img key={s} src={s} className="size-20 rounded-lg border-2 border-primary object-cover shadow-card" />)}</div>}
            </label>
          </Section>

          <Section title="📋 Item Details" sub="Describe the item clearly">
            <div className={grid}>
              <Field full label={<>Title <Req /></>}><input className={field} required maxLength={200} value={f.title} onChange={set('title')} placeholder="e.g. Lost Black iPhone 14 Pro with Blue Case" /></Field>
              <Field label={<>{isLost ? 'Date Lost' : 'Date Found'} <Req /></>}><input type="date" className={field} required max={today} value={f.lost_date} onChange={set('lost_date')} /></Field>
              <Field label={<>Category <Req /></>}><select className={field} required value={f.category} onChange={set('category')}><Opts list={CATEGORIES} ph="Select category…" /></select></Field>
              <Field label="Sub-Category"><select className={field} value={f.subcategory} onChange={set('subcategory')}><Opts list={SUBCATS[f.category] || []} ph={f.category ? 'Select subcategory…' : 'Select category first…'} /></select></Field>
              <Field label="Brand / Make"><input className={field} value={f.brand} onChange={set('brand')} placeholder="e.g. Apple, Samsung, Levis…" /></Field>
              <Field label={<>Primary Colour <Req /></>}><select className={field} required value={f.primary_color} onChange={set('primary_color')}><Opts list={COLORS} ph="Select colour…" /></select></Field>
              <Field label="Secondary Colour"><select className={field} value={f.secondary_color} onChange={set('secondary_color')}><Opts list={COLORS} ph="None / Not applicable" /></select></Field>
              <Field full label={<>Specific Description <Req /></>}><textarea rows={4} required className={`${field} min-h-[90px] resize-y`} value={f.description} onChange={set('description')} placeholder="Describe unique features, damage, stickers, engravings, contents, or anything that makes this item identifiable…" /></Field>
            </div>
          </Section>

          <Section title="📍 Location Information" sub={`Where was the item ${isLost ? 'lost' : 'found'}?`}>
            <div className={grid}>
              <Field full label={<>Specific Location <Req /></>}><input className={field} required value={f.specific_location} onChange={set('specific_location')} placeholder="e.g. Near Gate 3, Library 2nd Floor, Platform 4…" /></Field>
              <Field full label="Address"><input className={field} value={f.address} onChange={set('address')} placeholder="Street address, landmark, or place name…" /></Field>
              <Field label={<>Province / State <Req /></>}><select className={field} required value={f.state} onChange={set('state')}><Opts list={PROVINCES} ph="Select province…" /></select></Field>
              <Field label={<>City <Req /></>}><select className={`${field} disabled:cursor-not-allowed disabled:opacity-60`} required disabled={!f.state} value={f.city} onChange={set('city')}><Opts list={CITIES_BY_PROVINCE[f.state] || []} ph={f.state ? 'Select city…' : 'Select province first…'} /></select></Field>
            </div>
          </Section>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-line bg-[#fafcff] px-6 py-4">
            <button type="submit" disabled={busy} className={B(isLost ? 'danger' : 'success', 'lg')}>{busy ? 'Posting…' : isLost ? '📍 Post Lost Item Report' : '✅ Post Found Item Report'}</button>
            <Link to="/" className={B('ghost')}>Cancel</Link>
            <span className="ml-auto text-[11.5px] text-mute">⏱ Listing stays active for <strong>15 days</strong> then auto-expires</span>
          </div>
        </form>
      </Main>
    </>
  )
}
