import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import { FormField, fieldClass, validators, validate } from '../../components/FormField'

const EMPTY = { name: '', semester: '', section: '' }

export default function Classes() {
  const [data, setData]       = useState([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [error, setError]     = useState('')
  const [formErrors, setFormErrors] = useState({})

  const load = async () => {
    const res = await api.get('/classes/?limit=1000')
    setData(res.data)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setFormErrors({}); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...row }); setError(''); setFormErrors({}); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null); setFormErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const errs = validate({
      name:     [validators.required(form.name, 'Class Name')],
      semester: [validators.required(form.semester, 'Semester')],
      section:  [validators.required(form.section, 'Section')],
    })
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setFormErrors({})
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
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
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
          <FormField label="Class Name" required error={formErrors.name}>
            <input className={fieldClass(formErrors.name)} placeholder="e.g. Computer Science"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Semester" required error={formErrors.semester}>
              <input className={fieldClass(formErrors.semester)} placeholder="e.g. Semester 3"
                value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
            </FormField>
            <FormField label="Section" required error={formErrors.section}>
              <input className={fieldClass(formErrors.section)} placeholder="e.g. A"
                value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
            </FormField>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              ⚠ {error}
            </div>
          )}
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
