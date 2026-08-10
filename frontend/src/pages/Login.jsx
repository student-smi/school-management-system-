import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validation
    if (!form.email.trim()) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Enter a valid email address'); return }
    if (!form.password) { setError('Password is required'); return }
    if (form.password.length < 3) { setError('Password is too short'); return }

    setLoading(true)
    try {
      const role = await login(form.email, form.password)
      if (role === 'admin') navigate('/admin')
      else if (role === 'teacher') navigate('/teacher')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20
                        shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500
                            to-primary-700 items-center justify-center text-white text-3xl
                            font-bold shadow-xl mx-auto mb-4">
              🎓
            </div>
            <h1 className="text-2xl font-bold text-white">College SMS</h1>
            <p className="text-slate-400 text-sm mt-1">Student Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@college.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                           text-white placeholder-slate-500 focus:outline-none focus:ring-2
                           focus:ring-primary-400 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                           text-white placeholder-slate-500 focus:outline-none focus:ring-2
                           focus:ring-primary-400 transition-all duration-200 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3
                              text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500
                         hover:to-primary-400 text-white font-semibold py-3 rounded-xl
                         transition-all duration-200 shadow-lg hover:shadow-primary-500/25
                         disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6">
            Admin: admin@college.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
