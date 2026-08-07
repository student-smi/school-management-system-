export default function StatCard({ title, value, icon, gradient, subtitle }) {
  return (
    <div className={`stat-card ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  )
}
