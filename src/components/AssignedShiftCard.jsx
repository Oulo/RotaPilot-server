export default function AssignedShiftCard({ shift }) {
  return (
    <div style={styles.card}>
      <h3>Shift #{shift.shiftId}</h3>
      <p><b>Staff:</b> {shift.staffName}</p>
      <p style={{ color: "green" }}>Status: {shift.status}</p>
    </div>
  );
}

const styles = {
  card: {
    padding: 12,
    marginBottom: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    background: "#f8fff8"
  }
};