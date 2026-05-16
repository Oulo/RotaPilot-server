export default function StaffCard({ staff }) {

  const dragStart = (e) => {
    e.dataTransfer.setData("staffName", staff.name);
  };

  return (
    <div
      draggable
      onDragStart={dragStart}
      style={{
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        background: "#e8f0ff",
        cursor: "grab"
      }}
    >
      <strong>{staff.name}</strong>
      <div style={{ fontSize: 12 }}>
        {staff.skills?.join(", ")}
      </div>
    </div>
  );
}