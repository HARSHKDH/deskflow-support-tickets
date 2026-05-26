import { Draggable } from "@hello-pangea/dnd";

const PRIORITY_STYLES = {
  urgent: "bg-red-950 text-red-300 border-red-800",
  high:   "bg-orange-950 text-orange-300 border-orange-800",
  medium: "bg-yellow-950 text-yellow-300 border-yellow-800",
  low:    "bg-green-950 text-green-300 border-green-800",
};

const STATUS_ORDER = ["open", "in_progress", "resolved", "closed"];
const FORWARD_LABELS = { in_progress: "Start", resolved: "Resolve", closed: "Close" };
const BACK_LABELS    = { open: "Reopen", in_progress: "Reopen", resolved: "Re-open" };

function formatAge(minutes) {
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function TicketCard({ ticket, index, onMove, onDelete, isSnapBack }) {
  const idx = STATUS_ORDER.indexOf(ticket.status);
  const nextStatus = idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
  const prevStatus = idx > 0 ? STATUS_ORDER[idx - 1] : null;

  return (
    <Draggable draggableId={ticket._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-gray-800 rounded-xl p-3.5 border transition-all
            ${ticket.slaBreached ? "border-red-700 shadow-lg shadow-red-950/40" : "border-gray-700"}
            ${snapshot.isDragging ? "shadow-2xl opacity-90 rotate-1" : ""}
            ${isSnapBack ? "animate-bounce" : ""}
          `}
        >
          {/* SLA Warning */}
          {ticket.slaBreached && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mb-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              SLA BREACHED
            </div>
          )}

          {/* Subject */}
          <p className="text-sm font-semibold text-white leading-snug mb-1">
            {ticket.subject}
          </p>

          {/* Email */}
          <p className="text-xs text-gray-500 truncate mb-3">
            {ticket.customerEmail}
          </p>

          {/* Priority + Age */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${PRIORITY_STYLES[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              ⏱ {formatAge(ticket.ageMinutes)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {prevStatus && (
              <button
                onClick={() => onMove(ticket._id, prevStatus)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1 rounded-lg transition-all font-medium"
              >
                ← {BACK_LABELS[prevStatus] || prevStatus}
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => onMove(ticket._id, nextStatus)}
                className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-lg transition-all font-medium"
              >
                {FORWARD_LABELS[nextStatus] || nextStatus} →
              </button>
            )}
            <button
              onClick={() => onDelete(ticket._id)}
              className="ml-auto text-gray-600 hover:text-red-400 text-sm transition-all"
              title="Delete"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
