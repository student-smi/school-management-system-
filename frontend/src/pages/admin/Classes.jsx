import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const EMPTY = { name: '', semester: '', section: '' }

export default function Classes() {
  const [data, setData]   = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/classes/?limit=1000')
    setData(res.data)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setError(''); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editing) await api.put(`/classes/${editing.id}`, form)
      else         await api.post('/classes/', form)
      closeModal(); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving class.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return
    await api.delete(`/classes/${id}`)
    load()
  }

  const columns = [
    { key: 'name',     label: 'Class Name' },
    { key: 'semester', label: 'Semester' },
    { key: 'section',  label: 'Section' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-subtitle">{data.length} classes configured</p>
        </div>
        <button id="add-class-btn" className="btn-primary" onClick={openAdd}>+ Add Class</button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={data}
          actions={(row) => (
            <>
              <button className="btn-secondary text-xs px-3 py-1" onClick={() => openEdit(row)}>Edit</button>
              <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(row.id)}>Delete</button>
            </>
          )}
        />
      </div>

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Class Name *</label>
            <input className="input" required placeholder="e.g. Computer Science"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Semester *</label>
              <input className="input" required placeholder="Semester 3"
                value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
            </div>
            <div>
              <label className="label">Section *</label>
              <input className="input" required placeholder="A"
                value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Add Class'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
