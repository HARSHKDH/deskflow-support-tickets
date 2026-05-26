export default function StatsStrip({ stats }) {
  const items = [
    { label: "Open", key: "open", color: "text-blue-400" },
    { label: "In Progress", key: "in_progress", color: "text-yellow-400" },
    { label: "Resolved", key: "resolved", color: "text-green-400" },
    { label: "Closed", key: "closed", color: "text-gray-400" },
  ];
  return (
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex flex-wrap gap-6 items-center text-sm">
      {items.map(({ label, key, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs">{label}</span>
          <span className={`font-bold ${color}`}>{stats.byStatus?.[key] ?? 0}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2 bg-red-950 border border-red-800 px-3 py-1 rounded-full">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-400 text-xs font-semibold">
          {stats.breachedOpenCount ?? 0} SLA Breached
        </span>
      </div>
    </div>
  );
}
