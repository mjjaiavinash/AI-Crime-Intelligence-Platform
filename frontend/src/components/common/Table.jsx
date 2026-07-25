export default function Table({ columns, data, loading, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-x-auto -mx-0 w-full">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60">
            {columns.map((col) => (
              <th key={col.key}
                className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap ${
                  col.key === 'actions' ? 'w-px' : ''
                }`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-700/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-3.5 rounded bg-slate-700/60 animate-pulse" style={{ width: `${55 + (i * col.key.length * 3) % 35}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm text-slate-600">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i}
                className="border-b border-slate-700/30 hover:bg-white/[0.025] transition-colors duration-100 group">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-slate-300 whitespace-nowrap ${
                    col.key === 'actions' ? 'w-px' : ''
                  }`}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
