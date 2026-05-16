import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

import StaffCard from "./StaffCard";
import ShiftCard from "./ShiftCard";

export default function Dashboard() {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);

  // ─────────────────────────────
  // INITIAL LOAD
  // ─────────────────────────────
  useEffect(() => {
    fetch("http://localhost:3001/api/roster/generate")
      .then(res => res.json())
      .then(data => {
        setShifts(data.results.map(r => ({
          id: r.shiftId,
          status: r.status,
          staffName: r.staffName,
          skillRequired: "Shift",
          day: "Day",
          time: "Time",
          hours: 1
        })));
      });

    fetch("http://localhost:3001/api/roster/staff")
      .then(res => res.json())
      .then(setStaff);
  }, []);

  // ─────────────────────────────
  // LIVE UPDATES
  // ─────────────────────────────
  useEffect(() => {
    socket.on("shift-updated", (update) => {
      setShifts(prev =>
        prev.map(s =>
          s.id === update.shiftId
            ? {
                ...s,
                status: update.status,
                staffName: update.staffName
              }
            : s
        )
      );
    });

    return () => socket.off("shift-updated");
  }, []);

  return (
    <div style={{ display: "flex", gap: 20 }}>
      
      {/* STAFF */}
      <div style={{ width: "30%" }}>
        <h3>Staff</h3>
        {staff.map(s => (
          <StaffCard key={s.id} staff={s} />
        ))}
      </div>

      {/* SHIFTS */}
      <div style={{ width: "70%" }}>
        <h3>Shifts</h3>
        {shifts.map(shift => (
          <ShiftCard key={shift.id} shift={shift} />
        ))}
      </div>

    </div>
  );
}