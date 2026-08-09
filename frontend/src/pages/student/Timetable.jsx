import { useEffect, useState } from 'react'
import api from '../../api/axios'

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentTimetable() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const today = DAY_NAMES[new Date().getDay()]

  useEffect(() => {
    api.get('/timetable/my')
      .then(r => setEntries(r.data))
      .finally(() => setLoading(false))
  }, [])

  // Build grid: { day: { period: entry } }
  const grid = {}
  entries.forEach(e => {
    if (!grid[e.day]) grid[e.day] = {}
    grid[e.day][e.period_number] = e
  })

  // Today's schedule
  const todaySchedule = entries
    .filter(e => e.day === today)
    .sort((a, b) => a.period_number - b.period_number)

  if (loading) return <div className="p-6 text-gray-400">Loading timetable...</div>

  if (entries.length === 0) return (
    <div className="p-6">
      <h1 className="page-title">Timetable</h1>
      <div className="card text-center text-gray-400 py-12 mt-4">
        No timetable found for your class yet.
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Timetable</h1>
        <p className="page-subtitle">Weekly class schedule</p>
      </div>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <div className="card border-l-4 border-primary-500">
          <h2 className="font-bold text-gray-800 text-sm mb-3">
            📅 Today ({today})
          </h2>
          <div className="space-y-2">
            {todaySchedule.map(e => (
              <div key={e.id} className="flex items-center gap-4 bg-primary-50 rounded-lg px-4 py-2.5">
                <div className="text-center w-8">
                  <p className="font-bold text-primary-600 text-sm">P{e.period_number}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{e.subject_name || '—'}</p>
                  <p className="text-xs text-gray-500">{e.teacher_name || ''}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {e.start_time && e.end_time ? `${e.start_time} – ${e.end_time}` : ''}
                  {e.room_number && <p>🚪 {e.room_number}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Weekly Grid */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Weekly Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="bg-slate-700 text-white px-3 py-2.5 text-left font-semibold w-16 sticky left-0 z-10">P</th>
                {DAYS.map(d => (
                  <th key={d}
                    className={`px-3 py-2.5 text-center font-semibold min-w-[120px]
                      ${d === today ? 'bg-primary-600 text-white' : 'bg-slate-700 text-white'}`}>
                    {d.slice(0, 3)}
                    {d === today && <span className="ml-1 text-primary-200 text-xs">●</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className={period % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 border border-gray-100 sticky left-0 bg-slate-50 z-10 font-bold text-slate-600">
                    {period}
                  </td>
                  {DAYS.map(day => {
                    const cell = grid[day]?.[period]
                    const isToday = day === today
                    return (
                      <td key={day}
                        className={`border border-gray-100 px-2 py-2 text-center align-middle
                          ${isToday ? 'bg-primary-50/40' : ''}`}>
                        {cell ? (
                          <div>
                            <p className={`font-semibold truncate ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                              {cell.subject_name || '—'}
                            </p>
                            {cell.teacher_name && (
                              <p className="text-gray-400 truncate text-xs">{cell.teacher_name}</p>
                            )}
                            {cell.room_number && (
                              <p className="text-gray-300 text-xs">{cell.room_number}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
