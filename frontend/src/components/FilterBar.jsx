export default function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 mb-5 items-center">
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="bg-gray-800 border border-gray-700 text-sm text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.breached}
          onChange={(e) => onChange({ ...filters, breached: e.target.checked })}
          className="w-4 h-4 accent-red-500 rounded"
        />
        SLA Breached only
      </label>

      {(filters.priority || filters.breached) && (
        <button
          onClick={() => onChange({ priority: "", breached: false })}
          className="text-xs text-gray-500 hover:text-white underline transition-all"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
