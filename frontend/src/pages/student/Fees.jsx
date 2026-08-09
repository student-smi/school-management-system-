import { useEffect, useState } from 'react'
import api from '../../api/axios'

function statusBadge(status) {
  const styles = {
    Paid:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Pending: 'bg-red-100 text-red-700 border border-red-200',
    Partial: 'bg-amber-100 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>
      {status}
    </span>
  )
}

export default function StudentFees() {
  const [fees, setFees]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/fees/me')
      .then(r => setFees(r.data))
      .finally(() => setLoading(false))
  }, [])

  const totalAmount = fees.reduce((s, f) => s + f.amount, 0)
  const totalPaid   = fees.reduce((s, f) => s + f.paid_amount, 0)
  const totalDue    = totalAmount - totalPaid
  const paidCount   = fees.filter(f => f.status === 'Paid').length
  const pendingFees = fees.filter(f => f.status !== 'Paid')
  const paidFees    = fees.filter(f => f.status === 'Paid')

  if (loading) return (
    <div className="p-6 text-center text-gray-400 py-20">Loading your fee records...</div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Fees</h1>
        <p className="page-subtitle">Your fee payment records</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Fees</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="card py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Due</p>
          <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-500' : 'text-gray-400'}`}>
            ₹{totalDue.toLocaleString()}
          </p>
        </div>
        <div className="card py-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Cleared</p>
          <p className="text-2xl font-bold text-primary-600">{paidCount}/{fees.length}</p>
        </div>
      </div>

      {fees.length === 0 ? (
        <div className="card text-center text-gray-400 py-12 text-sm">
          No fee records found.
        </div>
      ) : (
        <>
          {/* ── Pending / Partial Fees ── */}
          {pendingFees.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                <h2 className="font-bold text-red-700 text-sm">
                  ⚠️ Pending / Partial Fees ({pendingFees.length})
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Fee Type</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Amount</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Paid</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Balance</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Due Date</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFees.map((fee, i) => (
                    <tr key={fee.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-medium text-gray-700">{fee.fee_type}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">₹{fee.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-emerald-600 font-medium">₹{fee.paid_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-red-500 font-bold">
                        ₹{(fee.amount - fee.paid_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(fee.status)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {fee.due_date ? (
                          <span className={new Date(fee.due_date) < new Date() ? 'text-red-500 font-semibold' : ''}>
                            {fee.due_date}
                            {new Date(fee.due_date) < new Date() && ' ⚠️'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{fee.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Paid Fees ── */}
          {paidFees.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                <h2 className="font-bold text-emerald-700 text-sm">
                  ✅ Paid Fees ({paidFees.length})
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Fee Type</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Amount</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Payment Date</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {paidFees.map((fee, i) => (
                    <tr key={fee.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-medium text-gray-700">{fee.fee_type}</td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-600">₹{fee.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(fee.status)}</td>
                      <td className="px-4 py-3 text-gray-500">{fee.payment_date || '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{fee.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
