import { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, attendance: 0, exams: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, classes, attendance, exams] = await Promise.all([
          api.get('/students/?limit=1000'),
          api.get('/classes/?limit=1000'),
          api.get('/attendance/?limit=1000'),
          api.get('/exams/?limit=1000'),
        ])
        const today = new Date().toISOString().split('T')[0]
        const todayAttendance = attendance.data.filter(a => a.date === today).length

        const upcoming = exams.data.filter(e => e.exam_date >= today).length

        setStats({
          students:   students.data.length,
          classes:    classes.data.length,
          attendance: todayAttendance,
          exams:      upcoming,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'Total Students',    value: stats.students,   icon: '👥', gradient: 'bg-gradient-to-br from-primary-600 to-primary-800',     subtitle: 'Enrolled students' },
    { title: 'Total Classes',     value: stats.classes,    icon: '🏫', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',         subtitle: 'Active classes' },
    { title: "Today's Attendance",value: stats.attendance, icon: '✅', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',          subtitle: 'Records marked today' },
    { title: 'Upcoming Exams',    value: stats.exams,      icon: '📝', gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',        subtitle: 'Scheduled exams' },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your college management system</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => <StatCard key={c.title} {...c} />)}
        </div>
      )}

      {/* Quick info */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Add Student',    href: '/admin/students',   emoji: '➕' },
            { label: 'Mark Attendance',href: '/admin/attendance', emoji: '✅' },
            { label: 'Add Exam',       href: '/admin/exams',      emoji: '📝' },
            { label: 'Manage Classes', href: '/admin/classes',    emoji: '🏫' },
            { label: 'Enter Results',  href: '/admin/results',    emoji: '📊' },
          ].map(({ label, href, emoji }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2 p-3 rounded-xl border border-gray-100
                         hover:border-primary-200 hover:bg-primary-50 transition-all duration-200
                         text-sm text-gray-600 hover:text-primary-700 font-medium"
            >
              <span>{emoji}</span> {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
