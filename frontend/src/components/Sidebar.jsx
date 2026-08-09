import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const adminLinks = [
  { to: '/admin',            label: 'Dashboard',  icon: '🏠' },
  { to: '/admin/students',   label: 'Students',   icon: '👥' },
  { to: '/admin/classes',    label: 'Classes',    icon: '🏫' },
  { to: '/admin/attendance', label: 'Attendance', icon: '✅' },
  { to: '/admin/exams',      label: 'Exams',      icon: '📝' },
  { to: '/admin/results',    label: 'Results',    icon: '📊' },
  { to: '/admin/fees',       label: 'Fees',       icon: '💰' },
  { to: '/admin/teachers',  label: 'Teachers',   icon: '👨‍🏫' },
  { to: '/admin/subjects',   label: 'Subjects',   icon: '📚' },
  { to: '/admin/timetable',  label: 'Timetable',  icon: '🗓️' },
]

const studentLinks = [
  { to: '/student',            label: 'Dashboard',  icon: '🏠' },
  { to: '/student/attendance', label: 'Attendance', icon: '✅' },
  { to: '/student/exams',      label: 'Exams',      icon: '📝' },
  { to: '/student/results',    label: 'Results',    icon: '📊' },
  { to: '/student/fees',       label: 'Fees',       icon: '💰' },
  { to: '/student/timetable',  label: 'Timetable',  icon: '🗓️' },
  { to: '/student/profile',    label: 'Profile',    icon: '👤' },
]

const teacherLinks = [
  { to: '/teacher',            label: 'Dashboard',  icon: '🏠' },
  { to: '/teacher/timetable',  label: 'Timetable',  icon: '🗓️' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const links = isAdmin ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-dark-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-white font-bold text-lg shadow-lg">
            C
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">College SMS</p>
            <p className="text-dark-600 text-xs capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/student'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 group
               ${isActive
                 ? 'bg-primary-600 text-white shadow-md'
                 : 'text-slate-400 hover:bg-dark-800 hover:text-white'
               }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
