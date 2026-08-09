import { useEffect, useState } from 'react'
import api from '../../api/axios'

// Auto-grade based on percentage
function autoGrade(marks, max) {
  if (marks === '' || marks === null || marks === undefined || !max) return ''
  const pct = (parseInt(marks) / max) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 35) return 'D'
  return 'F'
}

function gradeColor(g) {
  if (!g) return 'text-gray-400'
  if (['A+', 'A'].includes(g)) return 'text-emerald-600 font-bold'
  if (['B+', 'B'].includes(g)) return 'text-blue-600 font-bold'
  if (g === 'C') return 'text-amber-500 font-bold'
  if (g === 'D') return 'text-orange-500 font-bold'
  if (g === 'F') return 'text-red-600 font-bold'
  return 'text-gray-600 font-bold'
}

export default function Results() {
  const [classes, setClasses]           = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [classExams, setClassExams]     = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [students, setStudents]         = useState([])
  const [existingResults, setExistingResults] = useState([])  // already saved for this exam
  const [marks, setMarks]               = useState({})   // { studentId: { marks, remarks } }
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [submitMsg, setSubmitMsg]       = useState('')

  // Edit state for saved results
  const [editingId, setEditingId]       = useState(null)
  const [editForm, setEditForm]         = useState({})

  // Load classes on mount
  useEffect(() => {
    api.get('/classes/?limit=1000').then(r => setClasses(r.data))
  }, [])

  // When class changes → load exams for that class, reset exam selection
  useEffect(() => {
    setSelectedExam('')
    setStudents([])
    setExistingResults([])
    setMarks({})
    setSubmitMsg('')
    if (!selectedClass) { setClassExams([]); return }
    api.get('/exams/?limit=1000').then(r => {
      const filtered = r.data.filter(e => e.class_id === selectedClass)
      setClassExams(filtered.sort((a, b) => b.exam_date.localeCompare(a.exam_date)))
    })
  }, [selectedClass])

  // When exam changes → load students of that class + existing results for that exam
  useEffect(() => {
    setStudents([])
    setExistingResults([])
    setMarks({})
    setSubmitMsg('')
    if (!selectedExam || !selectedClass) return
    setLoadingStudents(true)
    Promise.all([
      api.get('/students/?limit=1000'),
      api.get(`/results/exam/${selectedExam}`),
    ]).then(([sRes, rRes]) => {
      const classStudents = sRes.data.filter(s => s.class_id === selectedClass)
      setStudents(classStudents)
      setExistingResults(rRes.data)

      // Pre-fill marks from existing results
      const initial = {}
      classStudents.forEach(s => {
        const existing = rRes.data.find(r => r.student_id === s.id)
        initial[s.id] = {
          marks:   existing ? String(existing.marks) : '',
          remarks: existing ? (existing.remarks || '') : '',
        }
      })
      setMarks(initial)
    }).finally(() => setLoadingStudents(false))
  }, [selectedExam])

  const currentExam = classExams.find(e => e.id === selectedExam)

  const handleMarksChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }))
  }

  const handleSubmit = async () => {
    if (!selectedExam || students.length === 0) return
    // Validate — all marks must be filled
    const missing = students.filter(s => marks[s.id]?.marks === '' || marks[s.id]?.marks === undefined)
    if (missing.length > 0) {
      setSubmitMsg(`❌ Please enter marks for: ${missing.map(s => s.name).join(', ')}`)
      return
    }
    setSubmitting(true); setSubmitMsg('')
    try {
      const records = students.map(s => ({
        student_id: s.id,
        marks: parseInt(marks[s.id].marks),
        grade: autoGrade(marks[s.id].marks, currentExam?.max_marks),
        remarks: marks[s.id].remarks || null,
      }))
      await api.post('/results/bulk', { exam_id: selectedExam, records })
      setSubmitMsg('✅ Results submitted successfully!')
      // Refresh existing results
      const rRes = await api.get(`/results/exam/${selectedExam}`)
      setExistingResults(rRes.data)
    } catch (err) {
      setSubmitMsg('❌ ' + (err.response?.data?.detail || 'Failed to submit results.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteResult = async (id) => {
    if (!window.confirm('Delete this result?')) return
    await api.delete(`/results/${id}`)
    const rRes = await api.get(`/results/exam/${selectedExam}`)
    setExistingResults(rRes.data)
  }

  const startEdit = (result) => {
    setEditingId(result.id)
    setEditForm({ marks: String(result.marks), remarks: result.remarks || '' })
  }

  const saveEdit = async (result) => {
    const grade = autoGrade(editForm.marks, currentExam?.max_marks)
    await api.put(`/results/${result.id}`, {
      marks: parseInt(editForm.marks),
      grade,
      remarks: editForm.remarks || null,
    })
    setEditingId(null)
    const rRes = await api.get(`/results/exam/${selectedExam}`)
    setExistingResults(rRes.data)
  }

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  const selectedClassName = classes.find(c => c.id === selectedClass)
  const classLabel = selectedClassName
    ? `${selectedClassName.name} — ${selectedClassName.semester} (${selectedClassName.section})`
    : ''

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Results</h1>
        <p className="page-subtitle">Select a class and exam to enter or view results</p>
      </div>

      {/* ── Step 1: Select Class ── */}
      <div className="card">
        <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
          Select Class
        </h2>
        <div>
          <label className="label">Current Class:</label>
          <select
            className="input max-w-md"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">— Choose a class —</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.semester} ({c.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Step 2: Select Exam ── */}
      {selectedClass && (
        <div className="card">
          <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
            Select Exam
          </h2>
          {classExams.length === 0 ? (
            <p className="text-gray-400 text-sm">No exams found for this class. Add exams first.</p>
          ) : (
            <div>
              <label className="label">Exam:</label>
              <select
                className="input max-w-md"
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
              >
                <option value="">— Choose an exam —</option>
                {classExams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.subject} &nbsp;|&nbsp; {e.exam_date} &nbsp;|&nbsp; Max: {e.max_marks}
                  </option>
                ))}
              </select>
              {currentExam && (
                <div className="mt-3 flex gap-6 text-sm text-gray-500">
                  <span>📅 Date: <strong className="text-gray-700">{currentExam.exam_date}</strong></span>
                  <span>📝 Subject: <strong className="text-gray-700">{currentExam.subject}</strong></span>
                  <span>🏆 Max Marks: <strong className="text-gray-700">{currentExam.max_marks}</strong></span>
                  <span className={`font-semibold ${currentExam.exam_date >= today ? 'text-amber-500' : 'text-gray-400'}`}>
                    {currentExam.exam_date >= today ? '⏳ Upcoming' : '✅ Completed'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Enter Marks ── */}
      {selectedExam && (
        <div className="card">
          <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
            Enter Marks
          </h2>

          {loadingStudents ? (
            <p className="text-gray-400 text-sm py-4">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No students enrolled in this class.</p>
          ) : (
            <>
              {/* Header row */}
              <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2">Marks <span className="normal-case text-gray-300">/ {currentExam?.max_marks}</span></div>
                <div className="col-span-1">Grade</div>
                <div className="col-span-4">Remarks</div>
              </div>

              <div className="space-y-1">
                {students.map((s, idx) => {
                  const m = marks[s.id]?.marks ?? ''
                  const grade = autoGrade(m, currentExam?.max_marks)
                  return (
                    <div
                      key={s.id}
                      className={`grid grid-cols-12 gap-3 items-center px-4 py-2 rounded-lg ${
                        idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      {/* Roll no */}
                      <div className="col-span-1 text-sm text-primary-500 font-semibold">
                        {s.roll_number || idx + 1}
                      </div>
                      {/* Name */}
                      <div className="col-span-4 text-sm text-gray-700 font-medium">{s.name}</div>
                      {/* Marks input */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          max={currentExam?.max_marks}
                          className="input text-sm py-1.5 text-center"
                          placeholder="0"
                          value={m}
                          onChange={e => handleMarksChange(s.id, 'marks', e.target.value)}
                        />
                      </div>
                      {/* Auto grade */}
                      <div className={`col-span-1 text-sm text-center ${gradeColor(grade)}`}>
                        {grade || '—'}
                      </div>
                      {/* Remarks */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          className="input text-sm py-1.5"
                          placeholder="Optional"
                          value={marks[s.id]?.remarks ?? ''}
                          onChange={e => handleMarksChange(s.id, 'remarks', e.target.value)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {submitMsg && (
                <p className={`mt-4 text-sm font-medium ${
                  submitMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {submitMsg}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Results'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Step 4: Saved Results for this exam ── */}
      {selectedExam && existingResults.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
            Saved Results — {currentExam?.name} ({currentExam?.subject})
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="text-left px-4 py-2 font-semibold">Student</th>
                <th className="text-left px-4 py-2 font-semibold">Roll No</th>
                <th className="text-center px-4 py-2 font-semibold">Marks</th>
                <th className="text-center px-4 py-2 font-semibold">Grade</th>
                <th className="text-left px-4 py-2 font-semibold">Remarks</th>
                <th className="text-right px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingResults.map((res, i) => {
                const stu = studentMap[res.student_id]
                const isEditing = editingId === res.id
                return (
                  <tr key={res.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-gray-700">{stu?.name || res.student_id}</td>
                    <td className="px-4 py-2 text-gray-500">{stu?.roll_number || '—'}</td>

                    {isEditing ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="number" min="0" max={currentExam?.max_marks}
                            className="input text-sm py-1 text-center w-20"
                            value={editForm.marks}
                            onChange={e => setEditForm({ ...editForm, marks: e.target.value })}
                          />
                        </td>
                        <td className={`px-4 py-2 text-center ${gradeColor(autoGrade(editForm.marks, currentExam?.max_marks))}`}>
                          {autoGrade(editForm.marks, currentExam?.max_marks) || '—'}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            className="input text-sm py-1"
                            placeholder="Remarks"
                            value={editForm.remarks}
                            onChange={e => setEditForm({ ...editForm, remarks: e.target.value })}
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => saveEdit(res)} className="btn-primary text-xs px-3 py-1">Save</button>
                            <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-3 py-1">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-center font-semibold text-gray-700">
                          {res.marks}<span className="text-gray-400 font-normal">/{currentExam?.max_marks}</span>
                        </td>
                        <td className={`px-4 py-2 text-center ${gradeColor(res.grade)}`}>
                          {res.grade || '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{res.remarks || '—'}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEdit(res)} className="btn-secondary text-xs px-3 py-1">Edit</button>
                            <button onClick={() => handleDeleteResult(res.id)} className="btn-danger text-xs px-3 py-1">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-4 flex gap-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
            <span>Total Students: <strong className="text-gray-700">{existingResults.length}</strong></span>
            <span>Average Marks: <strong className="text-gray-700">
              {(existingResults.reduce((sum, r) => sum + r.marks, 0) / existingResults.length).toFixed(1)}
            </strong></span>
            <span>Passed: <strong className="text-emerald-600">
              {existingResults.filter(r => r.grade !== 'F').length}
            </strong></span>
            <span>Failed: <strong className="text-red-500">
              {existingResults.filter(r => r.grade === 'F').length}
            </strong></span>
          </div>
        </div>
      )}

      {selectedExam && !loadingStudents && existingResults.length === 0 && students.length > 0 && (
        <div className="card text-center text-gray-400 py-8 text-sm">
          No results saved yet for this exam. Enter marks above and submit.
        </div>
      )}
    </div>
  )
}
