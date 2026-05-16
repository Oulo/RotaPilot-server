import ShiftCard from "./ShiftCard";
import StaffCard from "./StaffCard";

export default function RosterBoard({ roster }) {
  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>

      {/* STAFF LIST */}
      <div style={{ width: "30%" }}>
        <h3>Staff</h3>

        {roster.staff?.map((s, i) => (
          <StaffCard key={i} staff={s} />
        ))}
      </div>

      {/* SHIFTS */}
      <div style={{ width: "40%" }}>
        <h3>Shifts</h3>

        {roster.shifts?.map((shift, i) => (
          <ShiftCard
            key={i}
            shift={shift}
            assigned={
              roster.roster.find(
                r => r.shiftId === shift.id
              )
            }
          />
        ))}
      </div>

      {/* STATUS PANEL */}
      <div style={{ width: "30%" }}>
        <h3>Unfilled / Declined</h3>

        {roster.unfilledShifts?.map((u, i) => (
          <div key={i} style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            background: "#fff5f5"
          }}>
            <b>Shift #{u.shiftId}</b>
            <p>{u.reason}</p>

            {u.declines?.map((d, j) => (
              <div key={j} style={{ fontSize: 12 }}>
                ❌ {d.staffName}: {d.reasons.join(", ")}
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}