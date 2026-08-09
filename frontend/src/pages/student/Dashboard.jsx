import { useEffect, useState } from 'react'
import api from '../../api/axios'
import StatCard from '../../components/StatCard'

export default function StudentDashboard() {
  const [profile, setProfile]     = useState(null)
  const [attendance, setAttendance] = useState([])
  const [exams, setExams]         = useState([])
  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [p, a, e, r] = await Promise.all([
          api.get('/students/me'),
          api.get('/attendance/me'),
          api.get('/exams/my'),
          api.get('/results/me'),
        ])
        setProfile(p.data); setAttendance(a.data); setExams(e.data); setResults(r.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const presentCount = attendance.filter(a => a.status === 'Present').length
  const attendancePct = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0

  const today = new Date().toISOString().split('T')[0]
  const upcomingExams = exams.filter(e => e.exam_date >= today).length

  if (loading) return (
    <div className="p-6 text-center text-gray-400 py-20">Loading your dashboard...</div>
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Welcome, {profile?.name?.split(' ')[0] || 'Student'} 👋</h1>
        <p className="page-subtitle">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${attendancePct}%`}
          icon="✅" gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          subtitle={`${presentCount}/${attendance.length} classes`} />
        <StatCard title="Upcoming Exams" value={upcomingExams}
          icon="📝" gradient="bg-gradient-to-br from-primary-600 to-primary-800" />
        <StatCard title="Results Available" value={results.length}
          icon="📊" gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
        <StatCard title="Roll Number" value={profile?.roll_number || '—'}
          icon="🎓" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile card */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">My Profile</h2>
          <div className="space-y-2">
            {[
              ['Student ID', profile?.student_id],
              ['Email',      profile?.email],
              ['Phone',      profile?.phone],
              ['Gender',     profile?.gender],
              ['Date of Birth', profile?.dob],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
                <span className="text-gray-700 font-medium">{val || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent results */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Recent Results</h2>
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm">No results yet.</p>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between text-sm
                                           p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-600">{r.exam_id}</span>
                  <span className="font-bold text-primary-600">{r.marks} marks • {r.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
