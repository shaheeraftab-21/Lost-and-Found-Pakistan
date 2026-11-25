import { Link } from 'react-router-dom'
import { imgUrl } from '../api'
import { categoryIcon, fmtDate } from '../constants'

const chip = 'rounded-full border border-[#c3d8f8] bg-primary-l px-[9px] py-0.5 text-[11px] font-medium text-primary'

export default function ListingCard({ item }) {
  return (
    <Link to={`/listing/${item.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card transition duration-200 group-hover:-translate-y-[3px] group-hover:border-[#c3d8f8] group-hover:shadow-card-md">
        <div className="relative h-[180px] overflow-hidden bg-[#f1f5f9]">
          {item.images[0]
            ? <img src={imgUrl(item.images[0])} alt={item.title} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
            : <div className="flex size-full items-center justify-center text-[40px] text-[#c0ccd8]">{categoryIcon(item.category)}</div>}
          <span className={`absolute left-2.5 top-2.5 rounded-full px-[11px] py-1 text-[11px] font-bold uppercase tracking-[.3px] text-white ${item.type === 'lost' ? 'bg-bad' : 'bg-ok'}`}>{item.type}</span>
          <span className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-[9px] py-[3px] text-[10.5px] font-semibold text-white">⏱ {item.days_left}d left</span>
        </div>
        <div className="px-4 py-3.5">
          <div className="mb-[5px] truncate text-sm font-bold">{item.title}</div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {item.category && <span className={chip}>{item.category}</span>}
            {item.brand && <span className={chip}>{item.brand}</span>}
            {item.primary_color && <span className="rounded-full border border-line bg-[#f1f5f9] px-[9px] py-0.5 text-[11px] font-medium text-ink2">{item.primary_color}</span>}
          </div>
          {item.city && <div className="mb-2.5 flex items-center gap-1 text-xs text-mute">📍 {item.city}{item.venue ? ` · ${item.venue}` : ''}</div>}
          <div className="flex items-center justify-between border-t border-line-l pt-2.5">
            <span className="text-[11.5px] text-mute">{item.lost_date || fmtDate(item.created_at)}</span>
            <span className="rounded-[7px] border border-[#c3d8f8] bg-primary-l px-[13px] py-[5px] text-xs font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
