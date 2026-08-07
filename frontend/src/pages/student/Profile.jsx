import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/students/me').then(r => setProfile(r.data)).catch(() => {})
  }, [])

  if (!profile) return (
    <div className="p-6 text-center text-gray-400 py-20">Loading profile...</div>
  )

  const fields = [
    ['Student ID',   profile.student_id],
    ['Full Name',    profile.name],
    ['Email',        profile.email],
    ['Phone',        profile.phone],
    ['Gender',       profile.gender],
    ['Date of Birth',profile.dob],
    ['Roll Number',  profile.roll_number],
    ['Address',      profile.address],
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <h1 className="page-title">My Profile</h1>

      <div className="card max-w-xl">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {profile.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{profile.name}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map(([label, value]) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">
                {label}
              </span>
              <span className="text-sm text-gray-700 font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-300 text-center">
            To update your profile, contact the Admin.
          </p>
        </div>
      </div>
    </div>
  )
}
