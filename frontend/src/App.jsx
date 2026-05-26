import { useState, useEffect, useCallback } from "react";
import { fetchTickets, fetchStats, updateTicketStatus, deleteTicket } from "./api";
import StatsStrip from "./components/StatsStrip";
import FilterBar from "./components/FilterBar";
import Board from "./components/Board";
import CreateTicketModal from "./components/CreateTicketModal";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ priority: "", breached: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moveError, setMoveError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setError("");
      const [t, s] = await Promise.all([fetchTickets(filters), fetchStats()]);
      setTickets(t);
      setStats(s);
    } catch {
      setError("Failed to load data. Check your API connection.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const id = setInterval(loadAll, 60000);
    return () => clearInterval(id);
  }, [loadAll]);

  const handleMove = async (ticketId, newStatus) => {
    setMoveError("");
    try {
      const updated = await updateTicketStatus(ticketId, newStatus);
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? updated : t)));
      fetchStats().then(setStats).catch(() => {});
    } catch (e) {
      const msg = e.error || "Transition not allowed";
      setMoveError(msg);
      setTimeout(() => setMoveError(""), 4000);
      return false;
    }
    return true;
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      fetchStats().then(setStats).catch(() => {});
    } catch (e) {
      setMoveError(e.error || "Failed to delete ticket");
    }
  };

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    fetchStats().then(setStats).catch(() => {});
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-indigo-400 tracking-tight">DeskFlow</h1>
          <p className="text-xs text-gray-500">Support Ticket Triage Board</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
        >
          + New Ticket
        </button>
      </header>

      {stats && <StatsStrip stats={stats} />}

      <main className="px-4 md:px-6 py-5">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {moveError && (
          <div className="bg-orange-900/30 border border-orange-700 text-orange-300 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span>⚠</span> {moveError}
          </div>
        )}

        <FilterBar filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
            Loading tickets...
          </div>
        ) : (
          <Board tickets={tickets} onMove={handleMove} onDelete={handleDelete} />
        )}
      </main>

      {showModal && (
        <CreateTicketModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
