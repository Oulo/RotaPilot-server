import { assignShift } from "../utils/rosterApi";

export default function ShiftCard({ shift }) {

  const handleDrop = async (e) => {
    e.preventDefault();

    const staffName = e.dataTransfer.getData("staffName");

    const result = await assignShift(shift, staffName);

    // instant visual feedback
    alert(
      result.status === "assigned"
        ? "✅ Assigned successfully"
        : "❌ " + result.reasons?.join(", ")
    );
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        border: "1px solid #ddd",
        background:
          shift.status === "assigned"
            ? "#d4f7d4"
            : "#fff"
      }}
    >
      <strong>Shift #{shift.id}</strong>

      <div>{shift.staffName || "Unassigned"}</div>

      <small>{shift.status}</small>
    </div>
  );
}