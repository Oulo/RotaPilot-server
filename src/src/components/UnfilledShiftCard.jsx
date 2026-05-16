export default function UnfilledShiftCard({ shift }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <span style={styles.badge}>UNFILLED</span>
        <span>Shift #{shift.shiftId}</span>
      </div>

      <p style={styles.reason}>{shift.reason}</p>

      <div style={styles.declines}>
        {shift.declines.map((d, i) => (
          <div key={i} style={styles.declineRow}>
            <b>{d.staffName}</b>
            <span>{d.reasons.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#666"
  },

  badge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "3px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 11
  },

  reason: {
    marginTop: 10,
    color: "#b91c1c",
    fontWeight: 500
  },

  declines: {
    marginTop: 10,
    fontSize: 13
  },

  declineRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    borderBottom: "1px solid #f1f1f1"
  }
};