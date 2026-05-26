import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const LABELS = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };

export default function Board({ tickets, onMove, onDelete }) {
  const [snapBack, setSnapBack] = useState(null);

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const success = await onMove(draggableId, destination.droppableId);
    if (success === false) {
      setSnapBack(draggableId);
      setTimeout(() => setSnapBack(null), 600);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            label={LABELS[status]}
            tickets={grouped[status]}
            onMove={onMove}
            onDelete={onDelete}
            snapBack={snapBack}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
