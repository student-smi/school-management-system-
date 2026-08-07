import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Table from '../../components/Table'

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [exams, setExams]     = useState([])

  useEffect(() => {
    Promise.all([api.get('/results/me'), api.get('/exams/?limit=100')]).then(([r, e]) => {
      setResults(r.data); setExams(e.data)
    })
  }, [])

  const examMap = Object.fromEntries(exams.map(e => [e.id, e]))

  const gradeColor = (g) => {
    if (['A+','A'].includes(g)) return 'text-emerald-600 font-bold'
    if (['B+','B'].includes(g)) return 'text-blue-600 font-bold'
    if (g === 'F') return 'text-red-600 font-bold'
    return 'text-gray-700 font-bold'
  }

  const columns = [
    { key: 'exam_id', label: 'Exam',    render: (v) => examMap[v]?.name || v },
    { key: 'exam_id', label: 'Subject', render: (v) => examMap[v]?.subject || '—' },
    { key: 'marks',   label: 'Marks',   render: (v, row) => `${v} / ${examMap[row.exam_id]?.max_marks ?? '?'}` },
    { key: 'grade',   label: 'Grade',   render: (v) => <span className={gradeColor(v)}>{v || '—'}</span> },
    { key: 'remarks', label: 'Remarks' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <h1 className="page-title">My Results</h1>

      <div className="card">
        {results.length === 0
          ? <p className="text-gray-400 text-sm py-6 text-center">No results published yet.</p>
          : <Table columns={columns} data={results} />
        }
      </div>
    </div>
  )
}
