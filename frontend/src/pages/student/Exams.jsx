import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'

export default function StudentExams() {
  const [data, setData] = useState([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/exams/my').then(r => setData(r.data))
  }, [])

  const upcoming = data.filter(e => e.exam_date >= today)
  const past     = data.filter(e => e.exam_date < today)

  const columns = [
    { key: 'name',      label: 'Exam Name' },
    { key: 'subject',   label: 'Subject' },
    { key: 'exam_date', label: 'Date' },
    { key: 'max_marks', label: 'Max Marks' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <h1 className="page-title">Exams</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">📅 Upcoming Exams ({upcoming.length})</h2>
        <Table columns={columns} data={upcoming} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-400 mb-3">Past Exams ({past.length})</h2>
        <Table columns={columns} data={past} />
      </div>
    </div>
  )
}
