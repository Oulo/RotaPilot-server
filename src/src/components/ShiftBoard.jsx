import { Droppable } from "@hello-pangea/dnd";

export default function ShiftBoard({ roster }) {
  const shifts = roster?.shifts || [];
  const assigned = roster?.results || [];

  return (
    <div style={{ flex: 1 }}>
      <h2>📅 Shifts</h2>

      {/* AVAILABLE SHIFTS (DROP TARGETS) */}
      {shifts.map((shift) => (
        <Droppable key={shift.id} droppableId={String(shift.id)}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                padding: 12,
                marginBottom: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
                background: snapshot.isDraggingOver
                  ? "#e6f7ff"
                  : "white"
              }}
            >
              <h4>
                Shift #{shift.id} — {shift.day} {shift.time}
              </h4>

              <p>Skill: {shift.skillRequired}</p>
              <p>Hours: {shift.hours}</p>

              {/* SHOW ASSIGNMENT IF EXISTS */}
              {assigned
                .filter((a) => a.shiftId === shift.id && a.status === "assigned")
                .map((a, i) => (
                  <div
                    key={i}
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: "#d9f7be",
                      borderRadius: 6
                    }}
                  >
                    👤 {a.staffName} assigned
                  </div>
                ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}