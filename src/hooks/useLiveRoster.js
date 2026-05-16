import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

export function useLiveRoster(initialData) {
  const [roster, setRoster] = useState(initialData);

  useEffect(() => {
    socket.on("shift-updated", (update) => {
      setRoster((prev) => {
        const updated = { ...prev };

        updated.lastUpdate = update;

        updated.results = updated.results.map((r) =>
          r.shiftId === update.shiftId
            ? {
                ...r,
                status: update.status,
                staffName: update.staffName || null
              }
            : r
        );

        return updated;
      });
    });

    return () => socket.off("shift-updated");
  }, []);

  return { roster, setRoster };
}