import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/teachers/me')
      .then(r => setTeacher(r.data))
      .catch(() => setTeacher(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Welcome, {teacher?.name || 'Teacher'} 👋</h1>
        <p className="page-subtitle">Teacher Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="font-semibold text-gray-800">{teacher?.email || '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Phone</p>
          <p className="font-semibold text-gray-800">{teacher?.phone || '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Qualification</p>
          <p className="font-semibold text-gray-800">{teacher?.qualification || '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Subject</p>
          <p className="font-semibold text-gray-800">{teacher?.subject_name || '—'}</p>
        </div>
      </div>
    </div>
  )
}
