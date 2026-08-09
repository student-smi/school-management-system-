import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal from '../../components/Modal'

const EMPTY = {
  name: '', email: '', phone: '', qualification: '',
  specialization: '', address: '', gender: '',
  password: '', subject_id: ''
}

export default function Teachers() {
  const [teachers, setTeachers]   = useState([])
  const [subjects, setSubjects]   = useState([])
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [credentials, setCredentials] = useState(null)  // show after create

  const load = async () => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        api.get('/teachers/?limit=500'),
        api.get('/subjects/?limit=500'),
      ])
      setTeachers(tRes.data)
      setSubjects(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (t) => {
    setEditing(t)
    setForm({ ...EMPTY, ...t, password: '', subject_id: t.subject_id || '' })
    setError('')
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const payload = {
      name:           form.name,
      email:          form.email          || null,
      phone:          form.phone          || null,
      qualification:  form.qualification  || null,
      specialization: form.specialization || null,
      address:        form.address        || null,
      gender:         form.gender         || null,
      subject_id:     form.subject_id     || null,
      ...(!editing && { password: form.password || null }),
    }
    try {
      if (editing) {
        await api.put(`/teachers/${editing.id}`, payload)
        closeModal(); load()
      } else {
        const res = await api.post('/teachers/', payload)
        closeModal(); load()
        // Show credentials popup if login was created
        if (res.data.initial_password) {
          setCredentials({
            name:     res.data.name,
            email:    res.data.email,
            password: res.data.initial_password,
          })
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Something went wrong.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return
    await api.delete(`/teachers/${id}`)
    load()
  }

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]))

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.specialization || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">{teachers.length} teachers registered</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Teacher</button>
      </div>

      {/* Table */}
      <div className="card">
        <input
          className="input max-w-sm mb-5"
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-gray-400 text-sm py-6 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">
            {teachers.length === 0 ? 'No teachers yet. Add one!' : 'No results found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="text-left px-4 py-3 font-semibold rounded-tl-lg">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Subject</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Login</th>
                  <th className="text-right px-4 py-3 font-semibold rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        {t.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.subject_id && subjectMap[t.subject_id] ? (
                        <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {subjectMap[t.subject_id].name}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{t.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {t.user_id ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">✅ Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs">No login</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary text-xs px-3 py-1" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn-danger text-xs px-3 py-1" onClick={() => handleDelete(t.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="label">Full Name *</label>
            <input className="input" required placeholder="e.g. Ramesh Patel"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="teacher@school.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="9876543210"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          {/* Password — only on create */}
          {!editing && (
            <div>
              <label className="label">Login Password</label>
              <input className="input" type="text" placeholder="Leave blank — auto generated"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <p className="text-xs text-slate-400 mt-1">
                Required only if email is provided. Leave blank for auto password.
              </p>
            </div>
          )}

          {/* Subject assign */}
          <div>
            <label className="label">Assign Subject</label>
            <select className="input" value={form.subject_id}
              onChange={e => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">— No subject assigned —</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.code ? ` (${s.code})` : ''}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">
                No subjects found. <a href="/admin/subjects" className="underline">Add subjects first</a>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" placeholder="Optional"
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Add Teacher'}
            </button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Credentials popup — shown once after create */}
      <Modal isOpen={!!credentials} onClose={() => setCredentials(null)} title="Teacher Login Credentials">
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
