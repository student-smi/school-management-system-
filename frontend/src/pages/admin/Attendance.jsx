import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const EMPTY = { student_id: '', class_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' }

export default function Attendance() {
  const [data, setData]       = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses]   = useState([])
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [filterDate, setFilterDate] = useState('')
  const [error, setError]       = useState('')

  const load = async () => {
    const [a, s, c] = await Promise.all([
      api.get('/attendance/?limit=1000'),
      api.get('/students/?limit=1000'),
      api.get('/classes/?limit=1000'),
    ])
    setData(a.data); setStudents(s.data); setClasses(c.data)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setError(''); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editing) await api.put(`/attendance/${editing.id}`, { status: form.status })
      else         await api.post('/attendance/', form)
      closeModal(); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving attendance.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return
    await api.delete(`/attendance/${id}`)
    load()
  }

  const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]))
  const classMap   = Object.fromEntries(classes.map(c => [c.id, `${c.name} (${c.section})`]))

  const filtered = filterDate ? data.filter(a => a.date === filterDate) : data

  const statusBadge = (v) => {
    if (v === 'Present') return <span className="badge-present">Present</span>
    if (v === 'Absent')  return <span className="badge-absent">Absent</span>
    return <span className="badge-late">Late</span>
  }

  const columns = [
    { key: 'student_id', label: 'Student',  render: (v) => studentMap[v] || v },
    { key: 'class_id',   label: 'Class',    render: (v) => classMap[v] || v },
    { key: 'date',       label: 'Date' },
    { key: 'status',     label: 'Status',   render: statusBadge },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{data.length} total records</p>
        </div>
        <button id="mark-attendance-btn" className="btn-primary" onClick={openAdd}>+ Mark Attendance</button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div>
            <label className="label">Filter by Date</label>
            <input type="date" className="input w-auto"
              value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {filterDate && (
            <button className="btn-secondary self-end" onClick={() => setFilterDate('')}>
              Clear
            </button>
          )}
        </div>
        <Table
          columns={columns}
          data={filtered}
          actions={(row) => (
            <>
              <button className="btn-secondary text-xs px-3 py-1" onClick={() => openEdit(row)}>Edit</button>
              <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(row.id)}>Delete</button>
            </>
          )}
        />
      </div>

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Update Attendance' : 'Mark Attendance'}>
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
                <label className="label">Class *</label>
                <select className="input" required value={form.class_id}
                  onChange={e => setForm({ ...form, class_id: e.target.value })}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.semester} ({c.section})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" required value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <label className="label">Status *</label>
            <select className="input" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Update' : 'Mark Attendance'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
