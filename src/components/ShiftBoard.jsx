import { Droppable } from "@hello-pangea/dnd";

export default function ShiftBoard({ roster }) {
  return (
    <div style={styles.board}>
      <h3>Shifts</h3>

      {roster.map((shift) => (
        <Droppable
          key={shift.shiftId}
          droppableId={String(shift.shiftId)}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                ...styles.shift,
                background: snapshot.isDraggingOver
                  ? "#e8f3ff"
                  : "#fff"
              }}
            >
              <div><b>Shift #{shift.shiftId}</b></div>
              <div>Status: {shift.status}</div>
              <div>Staff: {shift.staffName || "Unassigned"}</div>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}

const styles = {
  board: {
    padding: 12
  },
  shift: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #eee",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "0.2s"
  }
};