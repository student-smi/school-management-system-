import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'

const PAGE_SIZE = 5  // history dates per page

export default function Attendance() {
  const [classes, setClasses]             = useState([])
  const [students, setStudents]           = useState([])
  const [history, setHistory]             = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate]                   = useState(new Date().toISOString().split('T')[0])
  const [statuses, setStatuses]           = useState({})
  const [submitting, setSubmitting]       = useState(false)
  const [submitMsg, setSubmitMsg]         = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)

  // History pagination
  const [histPage, setHistPage] = useState(1)

  // History collapse
  const [collapsed, setCollapsed] = useState({})

  // Edit history
  const [editingDate, setEditingDate]   = useState(null)
  const [editStatuses, setEditStatuses] = useState({})
  const [editDateVal, setEditDateVal]   = useState('')

  useEffect(() => {
    api.get('/classes/?limit=1000').then(r => setClasses(r.data))
  }, [])

  useEffect(() => {
    if (!selectedClass) { setStudents([]); setHistory([]); setStatuses({}); return }
    setLoadingStudents(true)
    setHistPage(1)
    Promise.all([
      api.get('/students/?limit=1000'),
      api.get(`/attendance/class/${selectedClass}`),
    ]).then(([sRes, aRes]) => {
      const cls = sRes.data.filter(s => s.class_id === selectedClass)
      setStudents(cls)
      const init = {}
      cls.forEach(s => { init[s.id] = 'Present' })
      setStatuses(init)
      setHistory(aRes.data)
    }).finally(() => setLoadingStudents(false))
  }, [selectedClass])

  const toggleStatus = (studentId, status) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status) => {
    const updated = {}
    students.forEach(s => { updated[s.id] = status })
    setStatuses(updated)
  }

  // Live counters
  const presentCount = Object.values(statuses).filter(s => s === 'Present').length
  const absentCount  = Object.values(statuses).filter(s => s === 'Absent').length
  const lateCount    = Object.values(statuses).filter(s => s === 'Late').length

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return
    setSubmitting(true); setSubmitMsg('')
    try {
      const records = students.map(s => ({ student_id: s.id, status: statuses[s.id] || 'Present' }))
      await api.post('/attendance/bulk', { class_id: selectedClass, date, records })
      setSubmitMsg('✅ Attendance submitted successfully!')
      const aRes = await api.get(`/attendance/class/${selectedClass}`)
      setHistory(aRes.data)
      setHistPage(1)
    } catch (err) {
      setSubmitMsg('❌ ' + (err.response?.data?.detail || 'Failed to submit.'))
    } finally {
      setSubmitting(false)
    }
  }

  // Group history by date
  const grouped = useMemo(() => {
    return history.reduce((acc, rec) => {
      if (!acc[rec.date]) acc[rec.date] = []
      acc[rec.date].push(rec)
      return acc
    }, {})
  }, [history])

  const sortedDates  = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const totalPages   = Math.max(1, Math.ceil(sortedDates.length / PAGE_SIZE))
  const paginatedDates = sortedDates.slice((histPage - 1) * PAGE_SIZE, histPage * PAGE_SIZE)

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  const selectedClassName = classes.find(c => c.id === selectedClass)
  const classLabel = selectedClassName
    ? `${selectedClassName.name} — ${selectedClassName.semester} (${selectedClassName.section})`
    : ''

  const handleDeleteDate = async (dateKey) => {
    if (!window.confirm(`Delete attendance for ${dateKey}?`)) return
    await Promise.all(grouped[dateKey].map(r => api.delete(`/attendance/${r.id}`)))
    const aRes = await api.get(`/attendance/class/${selectedClass}`)
    setHistory(aRes.data)
  }

  const startEditAttendance = (dateKey) => {
    const s = {}
    grouped[dateKey].forEach(r => { s[r.student_id] = r.status })
    setEditStatuses(s)
    setEditingDate({ dateKey, type: 'attendance' })
  }

  const startEditDate = (dateKey) => {
    setEditDateVal(dateKey)
    setEditingDate({ dateKey, type: 'date' })
  }

  const saveEditAttendance = async (dateKey) => {
    await Promise.all(grouped[dateKey].map(r =>
      api.put(`/attendance/${r.id}`, { status: editStatuses[r.student_id] || r.status })
    ))
    setEditingDate(null)
    const aRes = await api.get(`/attendance/class/${selectedClass}`)
    setHistory(aRes.data)
  }

  const saveEditDate = async (dateKey) => {
    await Promise.all(grouped[dateKey].map(r =>
      api.put(`/attendance/${r.id}`, { date: editDateVal })
    ))
    setEditingDate(null)
    const aRes = await api.get(`/attendance/class/${selectedClass}`)
    setHistory(aRes.data)
  }

  const statusColor = (s) => {
    if (s === 'Present') return 'text-emerald-600 font-bold'
    if (s === 'Absent')  return 'text-red-500 font-bold'
    return 'text-amber-500 font-bold'
  }

  const statusBtnClass = (current, type) => {
    const active = {
      Present: 'bg-emerald-500 text-white shadow',
      Absent:  'bg-red-500 text-white shadow',
      Late:    'bg-amber-400 text-white shadow',
    }
    return current === type
      ? active[type]
      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Select a class to mark or view attendance</p>
      </div>

      {/* ── Step 1: Select Class ── */}
      <div className="card">
        <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
          Select Class
        </h2>
        <div>
          <label className="label">Current Class:</label>
          <select className="input max-w-md" value={selectedClass}
            onChange={e => { setSelectedClass(e.target.value); setSubmitMsg('') }}>
            <option value="">— Choose a class —</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.semester} ({c.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Step 2: Mark Attendance ── */}
      {selectedClass && (
        <div className="card">
          <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
            Mark Attendance
          </h2>

          {/* Date picker */}
          <div className="mb-5">
            <label className="label">Select Date:</label>
            <input type="date" className="input w-auto"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {loadingStudents ? (
            <p className="text-gray-400 text-sm py-4">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No students enrolled in this class.</p>
          ) : (
            <>
              {/* Quick actions + live counter */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex gap-2">
                  <button onClick={() => markAll('Present')}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                    ✅ Mark All Present
                  </button>
                  <button onClick={() => markAll('Absent')}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                    ❌ Mark All Absent
                  </button>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="text-emerald-600">✅ Present: {presentCount}</span>
                  <span className="text-red-500">❌ Absent: {absentCount}</span>
                  <span className="text-amber-500">⏳ Late: {lateCount}</span>
                  <span className="text-gray-400">Total: {students.length}</span>
                </div>
              </div>

              {/* Student list */}
              <div className="space-y-1">
                {students.map((s, idx) => (
                  <div key={s.id}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${
                      idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{s.name}</span>
                      <span className="text-xs text-primary-500 font-semibold">
                        ({s.roll_number || idx + 1})
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {['Present', 'Absent', 'Late'].map(st => (
                        <button key={st} onClick={() => toggleStatus(s.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusBtnClass(statuses[s.id], st)}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {submitMsg && (
                <p className={`mt-4 text-sm font-medium ${submitMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {submitMsg}
                </p>
              )}

              <button onClick={handleSubmit} disabled={submitting}
                className="btn-primary mt-5 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Attendance History ── */}
      {selectedClass && sortedDates.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-base">
              Attendance History — {classLabel}
            </h2>
            <span className="text-xs text-gray-400">{sortedDates.length} days recorded</span>
          </div>

          <div className="space-y-3">
            {paginatedDates.map(dateKey => {
              const recs        = grouped[dateKey]
              const present     = recs.filter(r => r.status === 'Present').length
              const absent      = recs.filter(r => r.status === 'Absent').length
              const late        = recs.filter(r => r.status === 'Late').length
              const pct         = Math.round((present / recs.length) * 100)
              const isCollapsed = collapsed[dateKey] !== false  // default collapsed
              const isEditingA  = editingDate?.dateKey === dateKey && editingDate?.type === 'attendance'
              const isEditingD  = editingDate?.dateKey === dateKey && editingDate?.type === 'date'
              const isToday     = dateKey === today

              return (
                <div key={dateKey} className={`border rounded-xl overflow-hidden ${isToday ? 'border-primary-200' : 'border-gray-200'}`}>

                  {/* Date header */}
                  <div className={`flex items-center justify-between px-4 py-3 ${isToday ? 'bg-primary-50' : 'bg-gray-50'} border-b border-gray-100`}>
                    <div className="flex items-center gap-3 flex-1">
                      {/* Collapse toggle */}
                      <button onClick={() => setCollapsed(p => ({ ...p, [dateKey]: !isCollapsed }))}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm w-5">
                        {isCollapsed ? '▶' : '▼'}
                      </button>

                      {/* Date */}
                      {isEditingD ? (
                        <div className="flex items-center gap-2">
                          <input type="date" className="input w-auto text-sm py-1" value={editDateVal}
                            onChange={e => setEditDateVal(e.target.value)} />
                          <button onClick={() => saveEditDate(dateKey)} className="btn-primary text-xs px-3 py-1">Save</button>
                          <button onClick={() => setEditingDate(null)} className="btn-secondary text-xs px-3 py-1">Cancel</button>
                        </div>
                      ) : (
                        <div>
                          <span className={`font-semibold text-sm ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                            {dateKey} {isToday && <span className="text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded-full ml-1">Today</span>}
                          </span>
                          {/* Mini stats */}
                          <div className="flex gap-3 text-xs mt-0.5">
                            <span className="text-emerald-600">✅ {present}</span>
                            <span className="text-red-500">❌ {absent}</span>
                            {late > 0 && <span className="text-amber-500">⏳ {late}</span>}
                            <span className="text-gray-400">{pct}% present</span>
                          </div>
                        </div>
                      )}

                      {/* Progress bar */}
                      {!isEditingD && (
                        <div className="flex-1 max-w-[120px] bg-gray-200 rounded-full h-1.5 hidden sm:block">
                          <div className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 ml-3">
                      {!isEditingD && !isEditingA && (
                        <>
                          <button onClick={() => startEditDate(dateKey)} className="btn-secondary text-xs px-2.5 py-1">Edit Date</button>
                          <button onClick={() => { startEditAttendance(dateKey); setCollapsed(p => ({ ...p, [dateKey]: false })) }}
                            className="btn-secondary text-xs px-2.5 py-1">Edit</button>
                          <button onClick={() => handleDeleteDate(dateKey)} className="btn-danger text-xs px-2.5 py-1">Delete</button>
                        </>
                      )}
                      {isEditingA && (
                        <>
                          <button onClick={() => saveEditAttendance(dateKey)} className="btn-primary text-xs px-2.5 py-1">Save</button>
                          <button onClick={() => setEditingDate(null)} className="btn-secondary text-xs px-2.5 py-1">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Collapsible student table */}
                  {!isCollapsed && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-700 text-white">
                          <th className="text-left px-4 py-2 font-semibold">Student</th>
                          <th className="text-left px-4 py-2 font-semibold">Roll No</th>
                          <th className="text-left px-4 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recs.map((rec, i) => {
                          const stu = studentMap[rec.student_id]
                          return (
                            <tr key={rec.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2 text-gray-700">{stu?.name || '—'}</td>
                              <td className="px-4 py-2 text-gray-500">{stu?.roll_number || '—'}</td>
                              <td className="px-4 py-2">
                                {isEditingA ? (
                                  <div className="flex gap-1">
                                    {['Present', 'Absent', 'Late'].map(st => (
                                      <button key={st}
                                        onClick={() => setEditStatuses(p => ({ ...p, [rec.student_id]: st }))}
                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                                          (editStatuses[rec.student_id] || rec.status) === st
                                            ? st === 'Present' ? 'bg-emerald-500 text-white'
                                              : st === 'Absent' ? 'bg-red-500 text-white'
                                              : 'bg-amber-400 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}>
                                        {st}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className={statusColor(rec.status)}>{rec.status.toUpperCase()}</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Pagination ── */}
          {sortedDates.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {((histPage - 1) * PAGE_SIZE) + 1}–{Math.min(histPage * PAGE_SIZE, sortedDates.length)} of {sortedDates.length} dates
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600
                             hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - histPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`d${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button key={p} onClick={() => setHistPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                          ${histPage === p ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        {p}
                      </button>
                    )
                  )
                }
                <button onClick={() => setHistPage(p => Math.min(totalPages, p + 1))} disabled={histPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600
                             hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedClass && !loadingStudents && sortedDates.length === 0 && students.length > 0 && (
        <div className="card text-center text-gray-400 py-8 text-sm">
          No attendance records yet. Mark attendance above.
        </div>
      )}
    </div>
  )
}
