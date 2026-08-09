import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'

const FEE_TYPES   = ['Tuition']
const PAGE_SIZE   = 10

function statusBadge(status) {
  const styles = {
    Paid:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Pending: 'bg-red-100 text-red-700 border border-red-200',
    Partial: 'bg-amber-100 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || ''}`}>
      {status}
    </span>
  )
}

export default function AdminFees() {
  const [classes, setClasses]             = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents]           = useState([])
  const [fees, setFees]                   = useState([])
  const [loading, setLoading]             = useState(false)

  // Bulk generate form
  const [amount, setAmount]       = useState('')
  const [feeType, setFeeType]     = useState('Tuition')
  const [dueDate, setDueDate]     = useState('')
  const [remarks, setRemarks]     = useState('')
  const [genMsg, setGenMsg]       = useState('')
  const [generating, setGenerating] = useState(false)

  // Filter + Search
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType]     = useState('All')
  const [page, setPage]                 = useState(1)

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({})

  useEffect(() => {
    api.get('/classes/?limit=1000').then(r => setClasses(r.data))
  }, [])

  useEffect(() => {
    setStudents([]); setFees([]); setGenMsg('')
    setSearch(''); setFilterStatus('All'); setFilterType('All'); setPage(1)
    if (!selectedClass) return
    loadData()
  }, [selectedClass])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sRes, fRes] = await Promise.all([
        api.get('/students/?limit=1000'),
        api.get(`/fees/class/${selectedClass}`),
      ])
      setStudents(sRes.data.filter(s => s.class_id === selectedClass))
      setFees(fRes.data)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!students.length) { setGenMsg('❌ No students in this class.'); return }
    setGenerating(true); setGenMsg('')
    try {
      await api.post('/fees/bulk', {
        student_ids: students.map(s => s.id),
        amount: parseInt(amount),
        fee_type: feeType,
        due_date: dueDate || null,
        remarks: remarks || null,
      })
      setGenMsg(`✅ Fee generated for ${students.length} students!`)
      setAmount(''); setDueDate(''); setRemarks('')
      loadData()
    } catch (err) {
      setGenMsg('❌ ' + (err.response?.data?.detail || 'Failed to generate fees.'))
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee record?')) return
    await api.delete(`/fees/${id}`)
    loadData()
  }

  const startEdit = (fee) => {
    setEditingId(fee.id)
    setEditForm({
      paid_amount:  String(fee.paid_amount),
      payment_date: fee.payment_date || '',
      remarks:      fee.remarks || '',
    })
  }

  const saveEdit = async (fee) => {
    await api.put(`/fees/${fee.id}`, {
      paid_amount:  parseInt(editForm.paid_amount) || 0,
      payment_date: editForm.payment_date || null,
      remarks:      editForm.remarks || null,
    })
    setEditingId(null)
    loadData()
  }

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  // ── Summary Stats ──────────────────────────────────────────
  const summary = useMemo(() => {
    const totalAmt  = fees.reduce((s, f) => s + f.amount, 0)
    const totalPaid = fees.reduce((s, f) => s + f.paid_amount, 0)
    const totalDue  = totalAmt - totalPaid
    const paidCount    = fees.filter(f => f.status === 'Paid').length
    const pendingCount = fees.filter(f => f.status === 'Pending').length
    const partialCount = fees.filter(f => f.status === 'Partial').length
    const paidPct = totalAmt > 0 ? Math.round((totalPaid / totalAmt) * 100) : 0
    return { totalAmt, totalPaid, totalDue, paidCount, pendingCount, partialCount, paidPct }
  }, [fees])

  // ── Filtered + Searched Records ────────────────────────────
  const filtered = useMemo(() => {
    return fees.filter(fee => {
      const stu = studentMap[fee.student_id]
      const name = (stu?.name || '').toLowerCase()
      const roll = (stu?.roll_number || '').toLowerCase()
      const matchSearch = !search || name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase())
      const matchStatus = filterStatus === 'All' || fee.status === filterStatus
      const matchType   = filterType   === 'All' || fee.fee_type === filterType
      return matchSearch && matchStatus && matchType
    })
  }, [fees, search, filterStatus, filterType, studentMap])

  // ── Pagination ─────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to page 1 when filters change
  const handleSearch = (val) => { setSearch(val);       setPage(1) }
  const handleStatus = (val) => { setFilterStatus(val); setPage(1) }
  const handleType   = (val) => { setFilterType(val);   setPage(1) }

  const selectedClassName = classes.find(c => c.id === selectedClass)
  const classLabel = selectedClassName
    ? `${selectedClassName.name} — ${selectedClassName.semester} (${selectedClassName.section})`
    : ''

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Fees</h1>
        <p className="page-subtitle">Select a class to generate or manage fee records</p>
      </div>

      {/* ── Step 1: Select Class ── */}
      <div className="card">
        <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
          Select Class
        </h2>
        <select className="input max-w-md" value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}>
          <option value="">— Choose a class —</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.semester} ({c.section})
            </option>
          ))}
        </select>
      </div>

      {selectedClass && !loading && fees.length > 0 && (
        <>
          {/* ── Summary Bar ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="card py-3 text-center col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 mb-1">Total Fees</p>
              <p className="text-lg font-bold text-gray-800">₹{summary.totalAmt.toLocaleString()}</p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Collected</p>
              <p className="text-lg font-bold text-emerald-600">₹{summary.totalPaid.toLocaleString()}</p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Due</p>
              <p className={`text-lg font-bold ${summary.totalDue > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                ₹{summary.totalDue.toLocaleString()}
              </p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">✅ Paid</p>
              <p className="text-lg font-bold text-emerald-600">{summary.paidCount}</p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">🔴 Pending</p>
              <p className="text-lg font-bold text-red-500">{summary.pendingCount}</p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">⏳ Partial</p>
              <p className="text-lg font-bold text-amber-500">{summary.partialCount}</p>
            </div>
            <div className="card py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Collected %</p>
              <p className="text-lg font-bold text-primary-600">{summary.paidPct}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card py-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Collection Progress</span>
              <span>₹{summary.totalPaid.toLocaleString()} / ₹{summary.totalAmt.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.paidPct}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Step 2: Generate Fees ── */}
      {selectedClass && (
        <div className="card">
          <h2 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
            Generate Fee for All Students
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Fee Type *</label>
                <select className="input" value={feeType} onChange={e => setFeeType(e.target.value)}>
                  {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₹) *</label>
                <input className="input" type="number" min="1" required placeholder="5000"
                  value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input className="input" type="date"
                  value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input className="input" placeholder="Optional"
                  value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </div>
            {genMsg && (
              <p className={`text-sm font-medium ${genMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                {genMsg}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={generating}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {generating ? 'Generating...' : `Generate for ${students.length} Students`}
              </button>
              {students.length > 0 && (
                <span className="text-sm text-gray-400">{students.length} students in this class</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3: Filter + Search + Table ── */}
      {selectedClass && !loading && fees.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {/* Filter bar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <h2 className="font-bold text-gray-800 text-sm">
              Fee Records — {classLabel}
              <span className="ml-2 text-gray-400 font-normal text-xs">({filtered.length} of {fees.length})</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  className="input pl-8 py-2 text-sm"
                  placeholder="Search student name or roll no..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
              {/* Status filter */}
              <select className="input w-auto py-2 text-sm" value={filterStatus}
                onChange={e => handleStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Paid">✅ Paid</option>
                <option value="Pending">🔴 Pending</option>
                <option value="Partial">⏳ Partial</option>
              </select>
              {/* Fee type filter - hidden since only Tuition exists */}
              {/* Clear filters */}
              {(search || filterStatus !== 'All' || filterType !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setFilterStatus('All'); setFilterType('All') }}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No records match your filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Student</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Roll No</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Fee Type</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Due Date</th>
                    <th className="text-center px-4 py-2.5 text-gray-500 font-semibold">Amount</th>
                    <th className="text-center px-4 py-2.5 text-gray-500 font-semibold">Paid</th>
                    <th className="text-center px-4 py-2.5 text-gray-500 font-semibold">Balance</th>
                    <th className="text-center px-4 py-2.5 text-gray-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-semibold">Payment Date</th>
                    <th className="text-right px-4 py-2.5 text-gray-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((fee, i) => {
                    const stu       = studentMap[fee.student_id]
                    const isEditing = editingId === fee.id
                    const balance   = fee.amount - fee.paid_amount
                    const isOverdue = fee.due_date && fee.due_date < new Date().toISOString().split('T')[0] && fee.status !== 'Paid'

                    return (
                      <tr key={fee.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(stu?.name || '?').charAt(0)}
                            </div>
                            {stu?.name || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{stu?.roll_number || '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                            {fee.fee_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {fee.due_date ? (
                            <span className={isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                              {fee.due_date}{isOverdue ? ' ⚠️' : ''}
                            </span>
                          ) : '—'}
                        </td>

                        {isEditing ? (
                          <>
                            <td className="px-4 py-2.5 text-center font-semibold text-gray-700">₹{fee.amount}</td>
                            <td className="px-4 py-2.5">
                              <input type="number" min="0" max={fee.amount}
                                className="input text-sm py-1 text-center w-24"
                                value={editForm.paid_amount}
                                onChange={e => setEditForm({ ...editForm, paid_amount: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-2.5 text-center text-red-500 font-semibold">
                              ₹{Math.max(0, fee.amount - (parseInt(editForm.paid_amount) || 0))}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {(() => {
                                const p = parseInt(editForm.paid_amount) || 0
                                return statusBadge(p <= 0 ? 'Pending' : p >= fee.amount ? 'Paid' : 'Partial')
                              })()}
                            </td>
                            <td className="px-4 py-2.5">
                              <input type="date" className="input text-sm py-1 w-36"
                                value={editForm.payment_date}
                                onChange={e => setEditForm({ ...editForm, payment_date: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => saveEdit(fee)} className="btn-primary text-xs px-3 py-1">Save</button>
                                <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-3 py-1">Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2.5 text-center font-semibold text-gray-700">₹{fee.amount.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-center text-emerald-600 font-medium">₹{fee.paid_amount.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-center">
                              {balance > 0
                                ? <span className="text-red-500 font-semibold">₹{balance.toLocaleString()}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-center">{statusBadge(fee.status)}</td>
                            <td className="px-4 py-2.5 text-gray-500">{fee.payment_date || '—'}</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => startEdit(fee)} className="btn-secondary text-xs px-3 py-1">
                                  {fee.status === 'Pending' ? '💳 Pay' : 'Edit'}
                                </button>
                                <button onClick={() => handleDelete(fee.id)} className="btn-danger text-xs px-3 py-1">Delete</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} records
              </p>
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600
                             hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                          ${safePage === p
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )
                }

                {/* Next */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600
                             hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedClass && !loading && fees.length === 0 && (
        <div className="card text-center text-gray-400 py-8 text-sm">
          No fee records yet. Generate fees above.
        </div>
      )}

      {selectedClass && loading && (
        <div className="card text-center text-gray-400 py-8 text-sm">Loading...</div>
      )}
    </div>
  )
}
