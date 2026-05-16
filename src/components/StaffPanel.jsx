import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function StaffPanel({ staff }) {
  return (
    <Droppable droppableId="staff">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={styles.panel}
        >
          <h3>Staff</h3>

          {staff.map((s, i) => (
            <Draggable key={s.name} draggableId={s.name} index={i}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...styles.card,
                    ...provided.draggableProps.style
                  }}
                >
                  <b>{s.name}</b>
                  <div style={styles.sub}>
                    {s.skills?.join(", ")}
                  </div>
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

const styles = {
  panel: {
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    minHeight: 500
  },
  card: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    background: "#f9fafc",
    border: "1px solid #eee",
    cursor: "grab"
  },
  sub: { fontSize: 12, color: "#666" }
};