import { Droppable } from "@hello-pangea/dnd";
import TicketCard from "./TicketCard";

const TOP_COLORS = {
  open: "border-blue-600",
  in_progress: "border-yellow-500",
  resolved: "border-green-600",
  closed: "border-gray-600",
};

export default function Column({ status, label, tickets, onMove, onDelete, snapBack }) {
  return (
    <div className={`bg-gray-900 rounded-2xl border-t-4 ${TOP_COLORS[status]} flex flex-col min-h-[500px]`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</h2>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
          {tickets.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 flex flex-col gap-2 rounded-b-2xl transition-colors ${
              snapshot.isDraggingOver ? "bg-gray-800/50" : ""
            }`}
          >
            {tickets.length === 0 && (
              <p className="text-gray-700 text-xs text-center mt-10 select-none">
                No tickets
              </p>
            )}
            {tickets.map((ticket, index) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                index={index}
                onMove={onMove}
                onDelete={onDelete}
                isSnapBack={snapBack === ticket._id}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
