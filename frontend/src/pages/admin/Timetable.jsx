import { useEffect, useState } from 'react'
import api from '../../api/axios'

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

const DEFAULT_TIMES = {
  1: { start: '09:00', end: '09:45' },
  2: { start: '09:45', end: '10:30' },
  3: { start: '10:45', end: '11:30' },
  4: { start: '11:30', end: '12:15' },
  5: { start: '13:00', end: '13:45' },
  6: { start: '13:45', end: '14:30' },
  7: { start: '14:30', end: '15:15' },
  8: { start: '15:15', end: '16:00' },
}

export default function AdminTimetable() {
  const [classes,  setClasses]  = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [grid, setGrid]         = useState({})   // { "Monday_1": { subject_id, teacher_id, start_time, end_time, room_number, id? } }
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')

  // Cell edit popup
  const [editCell, setEditCell] = useState(null)  // { day, period }
  const [cellForm, setCellForm] = useState({})

  useEffect(() => {
    Promise.all([
      api.get('/classes/?limit=1000'),
      api.get('/subjects/?limit=500'),
      api.get('/teachers/?limit=500'),
    ]).then(([c, s, t]) => {
      setClasses(c.data)
      setSubjects(s.data)
      setTeachers(t.data)
    })
  }, [])

  useEffect(() => {
    if (!selectedClass) { setGrid({}); return }
    setLoading(true)
    api.get(`/timetable/class/${selectedClass}`)
      .then(r => {
        const g = {}
        r.data.forEach(e => {
          g[`${e.day}_${e.period_number}`] = {
            id: e.id, subject_id: e.subject_id || '',
            teacher_id: e.teacher_id || '',
            start_time: e.start_time || '', end_time: e.end_time || '',
            room_number: e.room_number || '',
            subject_name: e.subject_name, teacher_name: e.teacher_name,
          }
        })
        setGrid(g)
      })
      .finally(() => setLoading(false))
  }, [selectedClass])

  const openCell = (day, period) => {
    const key = `${day}_${period}`
    const existing = grid[key] || {}
    setCellForm({
      subject_id:  existing.subject_id  || '',
      teacher_id:  existing.teacher_id  || '',
      start_time:  existing.start_time  || DEFAULT_TIMES[period]?.start || '',
      end_time:    existing.end_time    || DEFAULT_TIMES[period]?.end   || '',
      room_number: existing.room_number || '',
    })
    setEditCell({ day, period })
  }

  const saveCell = () => {
    const key = `${editCell.day}_${editCell.period}`
    const sub = subjects.find(s => s.id === cellForm.subject_id)
    const tch = teachers.find(t => t.id === cellForm.teacher_id)
    setGrid(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...cellForm,
        subject_name: sub?.name || null,
        teacher_name: tch?.name || null,
      }
    }))
    setEditCell(null)
  }

  const clearCell = (day, period) => {
    const key = `${day}_${period}`
    setGrid(prev => { const g = { ...prev }; delete g[key]; return g })
  }

  const handleSaveTimetable = async () => {
    if (!selectedClass) return
    setSaving(true); setSaveMsg('')
    try {
      const entries = []
      Object.entries(grid).forEach(([key, val]) => {
        const [day, periodStr] = key.split('_')
        if (!val.subject_id && !val.teacher_id) return  // skip empty cells
        entries.push({
          class_id:     selectedClass,
          day,
          period_number: parseInt(periodStr),
          subject_id:   val.subject_id   || null,
          teacher_id:   val.teacher_id   || null,
          start_time:   val.start_time   || null,
          end_time:     val.end_time     || null,
          room_number:  val.room_number  || null,
        })
      })
      await api.post('/timetable/bulk', { class_id: selectedClass, entries })
      setSaveMsg('✅ Timetable saved successfully!')
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.detail || 'Failed to save.'))
    } finally {
      setSaving(false)
    }
  }

  const selectedClassName = classes.find(c => c.id === selectedClass)
  const classLabel = selectedClassName
    ? `${selectedClassName.name} — ${selectedClassName.semester} (${selectedClassName.section})`
    : ''

  const filledCount = Object.values(grid).filter(v => v.subject_id || v.teacher_id).length

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Timetable</h1>
        <p className="page-subtitle">Select a class to build its weekly schedule</p>
      </div>

      {/* Class Select */}
      <div className="card">
        <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">Select Class</h2>
        <select className="input max-w-md" value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setSaveMsg('') }}>
          <option value="">— Choose a class —</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.semester} ({c.section})
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {selectedClass && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">{classLabel}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{filledCount} periods filled — click any cell to edit</p>
            </div>
            <div className="flex items-center gap-3">
              {saveMsg && (
                <span className={`text-sm font-medium ${saveMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {saveMsg}
                </span>
              )}
              <button onClick={handleSaveTimetable} disabled={saving}
                className="btn-primary disabled:opacity-60">
                {saving ? 'Saving...' : '💾 Save Timetable'}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="bg-slate-700 text-white px-3 py-2.5 text-left font-semibold w-24 sticky left-0 z-10">
                      Period
                    </th>
                    {DAYS.map(d => (
                      <th key={d} className="bg-slate-700 text-white px-3 py-2.5 text-center font-semibold min-w-[130px]">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period} className={period % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {/* Period label */}
                      <td className="px-3 py-2 border border-gray-100 sticky left-0 bg-slate-50 z-10">
                        <p className="font-bold text-slate-700">P{period}</p>
                        <p className="text-gray-400 text-xs">
                          {DEFAULT_TIMES[period]?.start}–{DEFAULT_TIMES[period]?.end}
                        </p>
                      </td>
                      {DAYS.map(day => {
                        const key  = `${day}_${period}`
                        const cell = grid[key]
                        const filled = cell && (cell.subject_id || cell.teacher_id)
                        return (
                          <td key={day}
                            className="border border-gray-100 px-2 py-1.5 cursor-pointer hover:bg-primary-50 transition-colors align-top"
                            onClick={() => openCell(day, period)}
                          >
                            {filled ? (
                              <div className="space-y-0.5">
                                {cell.subject_name && (
                                  <p className="font-semibold text-primary-700 truncate">{cell.subject_name}</p>
                                )}
                                {cell.teacher_name && (
                                  <p className="text-gray-500 truncate">👤 {cell.teacher_name}</p>
                                )}
                                {cell.room_number && (
                                  <p className="text-gray-400 truncate">🚪 {cell.room_number}</p>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); clearCell(day, period) }}
                                  className="text-red-400 hover:text-red-600 text-xs mt-0.5"
                                >✕ clear</button>
                              </div>
                            ) : (
                              <p className="text-gray-300 text-center py-2">＋</p>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cell Edit Popup */}
      {editCell && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setEditCell(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800">
              {editCell.day} — Period {editCell.period}
              <span className="text-xs font-normal text-gray-400 ml-2">
                {DEFAULT_TIMES[editCell.period]?.start}–{DEFAULT_TIMES[editCell.period]?.end}
              </span>
            </h3>

            <div>
              <label className="label">Subject</label>
              <select className="input" value={cellForm.subject_id}
                onChange={e => setCellForm({ ...cellForm, subject_id: e.target.value })}>
                <option value="">— No subject —</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Teacher</label>
              <select className="input" value={cellForm.teacher_id}
                onChange={e => setCellForm({ ...cellForm, teacher_id: e.target.value })}>
                <option value="">— No teacher —</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Time</label>
                <input className="input" type="time" value={cellForm.start_time}
                  onChange={e => setCellForm({ ...cellForm, start_time: e.target.value })} />
              </div>
              <div>
                <label className="label">End Time</label>
                <input className="input" type="time" value={cellForm.end_time}
                  onChange={e => setCellForm({ ...cellForm, end_time: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Room Number</label>
              <input className="input" placeholder="e.g. A-101"
                value={cellForm.room_number}
                onChange={e => setCellForm({ ...cellForm, room_number: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={saveCell} className="btn-primary flex-1">Set Period</button>
              <button onClick={() => setEditCell(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
