export default function Table({ columns, data, actions }) {
  if (!data) return (
    <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
  )
  if (data.length === 0) return (
    <div className="text-center py-10 text-gray-400 text-sm">No records found.</div>
  )

  return (
    <>
      {/* ── Desktop Table ── */}
      <div className="hidden sm:block table-wrapper">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
              {actions && <th className="text-right">Actions</th>}
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
                    <div className="flex items-center justify-end gap-2">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card View ── */}
      <div className="sm:hidden space-y-3">
        {data.map((row, i) => (
          <div key={row.id || i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            {/* First column as title */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {columns[1]?.render
                    ? columns[1].render(row[columns[1].key], row)
                    : row[columns[1]?.key] || row[columns[0]?.key] || '—'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {columns[0]?.label}: {
                    columns[0]?.render
                      ? columns[0].render(row[columns[0].key], row)
                      : row[columns[0]?.key] || '—'
                  }
                </p>
              </div>
              {actions && (
                <div className="flex items-center gap-1.5 flex-shrink-0">{actions(row)}</div>
              )}
            </div>
            {/* Remaining columns as key-value pairs */}
            <div className="space-y-1.5">
              {columns.slice(2).map(col => {
                const val = col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')
                if (!val || val === '—') return null
                return (
                  <div key={col.key} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-20 flex-shrink-0">{col.label}</span>
                    <span className="text-gray-600 font-medium">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
