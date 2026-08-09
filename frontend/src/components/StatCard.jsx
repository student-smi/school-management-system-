export default function StatCard({ title, value, icon, gradient, subtitle }) {
  return (
    <div className={`stat-card ${gradient} p-4 sm:p-6`}>
      <div className="flex items-center justify-between sm:items-start">
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl sm:text-4xl font-bold mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1 truncate">{subtitle}</p>}
        </div>
        <span className="text-2xl sm:text-3xl opacity-80 ml-3 flex-shrink-0">{icon}</span>
      </div>
    </div>
  )
}
