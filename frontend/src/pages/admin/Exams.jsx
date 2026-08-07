import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const EMPTY = { name: '', subject: '', exam_date: '', max_marks: 100, class_id: '' }

export default function Exams() {
  const [data, setData]       = useState([])
  const [classes, setClasses] = useState([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [error, setError]     = useState('')

  const load = async () => {
    const [e, c] = await Promise.all([
      api.get('/exams/?limit=1000'),
      api.get('/classes/?limit=1000'),
    ])
    setData(e.data); setClasses(c.data)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setError(''); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const payload = { ...form, max_marks: parseInt(form.max_marks) }
      if (editing) await api.put(`/exams/${editing.id}`, payload)
      else         await api.post('/exams/', payload)
      closeModal(); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving exam.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return
    await api.delete(`/exams/${id}`)
    load()
  }

  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} (${c.section})`]))
  const today = new Date().toISOString().split('T')[0]

  const columns = [
    { key: 'name',      label: 'Exam Name' },
    { key: 'subject',   label: 'Subject' },
    { key: 'exam_date', label: 'Date',
      render: (v) => (
        <span className={v >= today ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{v}</span>
      )
    },
    { key: 'max_marks', label: 'Max Marks' },
    { key: 'class_id',  label: 'Class', render: (v) => classMap[v] || 'All' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">{data.length} exams scheduled</p>
        </div>
        <button id="add-exam-btn" className="btn-primary" onClick={openAdd}>+ Add Exam</button>
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

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Exam' : 'Add Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Exam Name *</label>
            <input className="input" required placeholder="Mid-Term Exam"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject *</label>
              <input className="input" required placeholder="Mathematics"
                value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="label">Max Marks *</label>
              <input className="input" type="number" min="1" required
                value={form.max_marks} onChange={e => setForm({ ...form, max_marks: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" required value={form.exam_date}
                onChange={e => setForm({ ...form, exam_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Class</label>
              <select className="input" value={form.class_id}
                onChange={e => setForm({ ...form, class_id: e.target.value })}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.semester} ({c.section})</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Save' : 'Add Exam'}</button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
