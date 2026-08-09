import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const EMPTY = {
  student_id: '', name: '', email: '', phone: '', password: '',
  gender: '', dob: '', address: '', class_id: '', roll_number: ''
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses]   = useState([])
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [search, setSearch]     = useState('')
  const [error, setError]       = useState('')
  const [credentials, setCredentials] = useState(null)

  const load = async () => {
    const [s, c] = await Promise.all([
      api.get('/students/?limit=1000'),
      api.get('/classes/?limit=1000'),
    ])
    setStudents(s.data)
    setClasses(c.data)
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (row) => { setEditing(row); setForm({ ...EMPTY, ...row }); setError(''); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const payload = {
      ...form,
      gender: form.gender || null,
      dob: form.dob || null,
      class_id: form.class_id || null,
      phone: form.phone || null,
      address: form.address || null,
      roll_number: form.roll_number || null,
      password: form.password || null,
    }
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, payload)
        closeModal(); load()
      } else {
        const res = await api.post('/students/', payload)
        closeModal(); load()
        setCredentials({
          name: res.data.name,
          email: res.data.email,
          password: res.data.initial_password,
        })
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Something went wrong.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return
    await api.delete(`/students/${id}`)
    load()
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} - ${c.semester} (${c.section})`]))

  const columns = [
    { key: 'student_id',  label: 'ID' },
    { key: 'name',        label: 'Name' },
    { key: 'email',       label: 'Email' },
    { key: 'phone',       label: 'Phone' },
    { key: 'class_id',    label: 'Class', render: (v) => classMap[v] || '—' },
    { key: 'roll_number', label: 'Roll No.' },
    { key: 'gender',      label: 'Gender' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} enrolled students</p>
        </div>
        <button id="add-student-btn" className="btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>

      <div className="card">
        <input
          id="student-search"
          className="input max-w-sm mb-4"
          placeholder="Search by name, ID or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class — top pe taaki pehle dikhe */}
          <div>
            <label className="label">Class *</label>
            <select className="input" value={form.class_id}
              onChange={e => setForm({ ...form, class_id: e.target.value })}>
              <option value="">— Select Class —</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.semester} ({c.section})
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">No classes found. Add classes first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Student ID *</label>
              <input className="input" required value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })} />
            </div>
            <div>
              <label className="label">Roll Number</label>
              <input className="input" value={form.roll_number}
                onChange={e => setForm({ ...form, roll_number: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Full Name *</label>
            <input className="input" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          {!editing && (
            <div>
              <label className="label">Login Password</label>
              <input className="input" type="text" value={form.password}
                placeholder="Leave blank to use Student ID as password"
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <p className="text-xs text-slate-500 mt-1">
                Student will use this email and password to log in.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={form.dob}
                onChange={e => setForm({ ...form, dob: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Add Student'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!credentials} onClose={() => setCredentials(null)} title="Student Login Credentials">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Share these login details with <strong>{credentials?.name}</strong>:
          </p>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm font-mono">
            <p><span className="text-slate-500">Email:</span> {credentials?.email}</p>
            <p><span className="text-slate-500">Password:</span> {credentials?.password}</p>
          </div>
          <p className="text-xs text-amber-600">
            Save these now — the password is shown only once.
          </p>
          <button className="btn-primary w-full" onClick={() => setCredentials(null)}>Got it</button>
        </div>
      </Modal>
    </div>
  )
}
