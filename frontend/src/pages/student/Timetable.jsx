import { useEffect, useState } from 'react'
import api from '../../api/axios'

const DAYS      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS   = [1, 2, 3, 4, 5, 6, 7, 8]
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentTimetable() {
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('day')   // 'day' | 'grid'
  const [selectedDay, setSelectedDay] = useState('')

  const today = DAY_NAMES[new Date().getDay()]

  useEffect(() => {
    api.get('/timetable/my')
      .then(r => setEntries(r.data))
      .finally(() => setLoading(false))
    setSelectedDay(today)
  }, [])

  const grid = {}
  entries.forEach(e => {
    if (!grid[e.day]) grid[e.day] = {}
    grid[e.day][e.period_number] = e
  })

  const todaySchedule = entries.filter(e => e.day === today).sort((a, b) => a.period_number - b.period_number)
  const daySchedule   = entries.filter(e => e.day === selectedDay).sort((a, b) => a.period_number - b.period_number)

  if (loading) return <div className="p-4 sm:p-6 text-gray-400">Loading timetable...</div>

  if (entries.length === 0) return (
    <div className="p-4 sm:p-6">
      <h1 className="page-title">Timetable</h1>
      <div className="card text-center text-gray-400 py-12 mt-4">No timetable found for your class yet.</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Timetable</h1>
          <p className="page-subtitle">Weekly class schedule</p>
        </div>
        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button onClick={() => setView('day')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'day' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>
            Day
          </button>
          <button onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>
            Grid
          </button>
        </div>
      </div>

      {/* Today banner */}
      {todaySchedule.length > 0 && (
        <div className="card border-l-4 border-primary-500 py-3">
          <p className="text-xs font-semibold text-primary-600 mb-2">📅 Today — {today}</p>
          <div className="flex flex-wrap gap-2">
            {todaySchedule.map(e => (
              <div key={e.id} className="bg-primary-50 rounded-lg px-3 py-2 text-xs">
                <span className="font-bold text-primary-600">P{e.period_number}</span>
                <span className="text-gray-700 ml-1.5">{e.subject_name || '—'}</span>
                {e.start_time && <span className="text-gray-400 ml-1.5">{e.start_time}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Day View (default, mobile-first) ── */}
      {view === 'day' && (
        <div className="card p-0 overflow-hidden">
          {/* Day tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50">
            {DAYS.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  selectedDay === d
                    ? 'border-primary-500 text-primary-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } ${d === today ? 'relative' : ''}`}>
                {d.slice(0, 3)}
                {d === today && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-500 rounded-full" />}
              </button>
            ))}
          </div>
          {/* Periods for selected day */}
          <div className="divide-y divide-gray-50">
            {PERIODS.map(period => {
              const cell = grid[selectedDay]?.[period]
              return (
                <div key={period} className={`flex items-center gap-4 px-4 py-3 ${cell ? '' : 'opacity-40'}`}>
                  <div className="w-8 text-center flex-shrink-0">
                    <p className="text-xs font-bold text-slate-600">P{period}</p>
                  </div>
                  {cell ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{cell.subject_name}</p>
                        {cell.teacher_name && <p className="text-xs text-gray-400 truncate">👤 {cell.teacher_name}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-400 flex-shrink-0">
                        {cell.start_time && <p>{cell.start_time}–{cell.end_time}</p>}
                        {cell.room_number && <p>🚪 {cell.room_number}</p>}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-300">Free period</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Grid View ── */}
      {view === 'grid' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="bg-slate-700 text-white px-3 py-2 text-left font-semibold w-10 sticky left-0 z-10">P</th>
                  {DAYS.map(d => (
                    <th key={d} className={`px-2 py-2 text-center font-semibold min-w-[90px]
                      ${d === today ? 'bg-primary-600 text-white' : 'bg-slate-700 text-white'}`}>
                      {d.slice(0, 3)}{d === today && ' ●'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period} className={period % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-2 py-2 border border-gray-100 sticky left-0 bg-slate-50 z-10 font-bold text-slate-600 text-center">{period}</td>
                    {DAYS.map(day => {
                      const cell = grid[day]?.[period]
                      const isToday = day === today
                      return (
                        <td key={day} className={`border border-gray-100 px-1.5 py-1.5 text-center align-middle ${isToday ? 'bg-primary-50/40' : ''}`}>
                          {cell ? (
                            <div>
                              <p className={`font-semibold truncate text-xs ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>{cell.subject_name}</p>
                              {cell.teacher_name && <p className="text-gray-400 truncate text-xs">{cell.teacher_name}</p>}
                            </div>
                          ) : <span className="text-gray-200">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
