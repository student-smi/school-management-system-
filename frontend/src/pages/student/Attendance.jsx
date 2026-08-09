import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'

export default function StudentAttendance() {
  const [data, setData]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/me').then(r => { setData(r.data); setLoading(false) })
  }, [])

  const present = data.filter(a => a.status === 'Present').length
  const pct = data.length > 0 ? Math.round((present / data.length) * 100) : 0

  const statusBadge = (v) => {
    if (v === 'Present') return <span className="badge-present">Present</span>
    if (v === 'Absent')  return <span className="badge-absent">Absent</span>
    return <span className="badge-late">Late</span>
  }

  const columns = [
    { key: 'date',   label: 'Date' },
    { key: 'status', label: 'Status', render: statusBadge },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <h1 className="page-title">My Attendance</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',   value: data.length,              color: 'bg-gray-100 text-gray-700' },
          { label: 'Present', value: present,                  color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Absent',  value: data.length - present,    color: 'bg-red-100 text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">Attendance Percentage</span>
          <span className="text-lg font-bold text-primary-600">{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Minimum 75% required</p>
      </div>

      <div className="card">
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <Table columns={columns} data={data} />
        )}
      </div>
    </div>
  )
}
