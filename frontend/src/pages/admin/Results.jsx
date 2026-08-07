import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const EMPTY = { student_id: '', exam_id: '', marks: '', grade: '', remarks: '' }

function autoGrade(marks, max) {
  if (!marks || !max) return ''
  const pct = (marks / max) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 35) return 'D'
  return 'F'
}

export default function Results() {
  const [data, setData]       = useState([])
  const [students, setStudents] = useState([])
  const [exams, setExams]     = useState([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [error, setError]     = useState('')

  const load = async () => {
    const [r, s, e] = await Promise.all([
      api.get('/results/?limit=1000'),
      api.get('/students/?limit=1000'),
      api.get('/exams/?limit=1000'),
    ])
    setData(r.data); setStudents(s.data); setExams(e.data)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setError(''); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const examMap   = Object.fromEntries(exams.map(e => [e.id, e]))
  const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const exam = examMap[form.exam_id]
    const grade = autoGrade(parseInt(form.marks), exam?.max_marks)
    const payload = { ...form, marks: parseInt(form.marks), grade }
    try {
      if (editing) await api.put(`/results/${editing.id}`, { marks: payload.marks, grade, remarks: form.remarks })
      else         await api.post('/results/', payload)
      closeModal(); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving result.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return
    await api.delete(`/results/${id}`)
    load()
  }

  const gradeColor = (g) => {
    if (!g) return ''
    if (['A+','A'].includes(g)) return 'text-emerald-600 font-bold'
    if (['B+','B'].includes(g)) return 'text-blue-600 font-bold'
    if (g === 'C') return 'text-amber-600 font-bold'
    if (g === 'F') return 'text-red-600 font-bold'
    return 'text-gray-600 font-bold'
  }

  const columns = [
    { key: 'student_id', label: 'Student',  render: (v) => studentMap[v] || v },
    { key: 'exam_id',    label: 'Exam',     render: (v) => examMap[v]?.name || v },
    { key: 'marks',      label: 'Marks',    render: (v, row) => `${v}/${examMap[row.exam_id]?.max_marks ?? '?'}` },
    { key: 'grade',      label: 'Grade',    render: (v) => <span className={gradeColor(v)}>{v || '—'}</span> },
    { key: 'remarks',    label: 'Remarks' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-subtitle">{data.length} result records</p>
        </div>
        <button id="add-result-btn" className="btn-primary" onClick={openAdd}>+ Add Result</button>
      </div>

      <div className="card">
        <Table columns={columns} data={data}
          actions={(row) => (
            <>
              <button className="btn-secondary text-xs px-3 py-1" onClick={() => openEdit(row)}>Edit</button>
              <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(row.id)}>Delete</button>
            </>
          )}
        />
      </div>

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Result' : 'Add Result'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <>
              <div>
                <label className="label">Student *</label>
                <select className="input" required value={form.student_id}
                  onChange={e => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Exam *</label>
                <select className="input" required value={form.exam_id}
                  onChange={e => setForm({ ...form, exam_id: e.target.value })}>
                  <option value="">Select Exam</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.name} — {e.subject} ({e.exam_date})</option>)}
                </select>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Marks *</label>
              <input className="input" type="number" min="0" required value={form.marks}
                onChange={e => setForm({ ...form, marks: e.target.value })} />
            </div>
            <div>
              <label className="label">Grade (auto-computed)</label>
              <input className="input" readOnly value={autoGrade(parseInt(form.marks), examMap[form.exam_id]?.max_marks) || form.grade || '—'} />
            </div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <input className="input" placeholder="Optional remarks"
              value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Add Result'}</button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
