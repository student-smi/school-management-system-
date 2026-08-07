export default function Table({ columns, data, actions }) {
  if (!data) return (
    <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
  )
  if (data.length === 0) return (
    <div className="text-center py-10 text-gray-400 text-sm">No records found.</div>
  )

  return (
    <div className="table-wrapper">
      <table className="table-base">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="animate-fade-in">
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
              {actions && (
                <td>
                  <div className="flex items-center gap-2">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
