import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

// Pages
import Login            from './pages/Login'
import AdminDashboard   from './pages/admin/Dashboard'
import Students         from './pages/admin/Students'
import Classes          from './pages/admin/Classes'
import Attendance       from './pages/admin/Attendance'
import Exams            from './pages/admin/Exams'
import Results          from './pages/admin/Results'
import StudentDashboard from './pages/student/Dashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentExams     from './pages/student/Exams'
import StudentResults   from './pages/student/Results'
import StudentProfile   from './pages/student/Profile'

// ── Protected layout with sidebar ──
function DashboardLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!user)   return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}

// ── Redirect by role ──
function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
}

// ── Admin-only guard ──
function AdminRoute() {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/student" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route element={<DashboardLayout />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin"            element={<AdminDashboard />} />
              <Route path="/admin/students"   element={<Students />} />
              <Route path="/admin/classes"    element={<Classes />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/exams"      element={<Exams />} />
              <Route path="/admin/results"    element={<Results />} />
            </Route>

            {/* Student routes */}
            <Route path="/student"            element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/exams"      element={<StudentExams />} />
            <Route path="/student/results"    element={<StudentResults />} />
            <Route path="/student/profile"    element={<StudentProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
