import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function StaffPanel({ staff }) {
  return (
    <Droppable droppableId="staff">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ width: 200, padding: 10, border: "1px solid #ccc" }}
        >
          <h3>👥 Staff</h3>

          {staff.map((s, index) => (
            <Draggable
              key={s.name}
              draggableId={s.name}
              index={index}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    background: "#f3f3f3",
                    border: "1px solid #ddd",
                    ...provided.draggableProps.style
                  }}
                >
                  {s.name}
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