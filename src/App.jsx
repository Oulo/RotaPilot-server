import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import Login from "./pages/Login";
import { DragDropContext } from "@hello-pangea/dnd";

import StaffPanel from "./components/StaffPanel";
import ShiftBoard from "./components/ShiftBoard";
import { fetchAutoRoster, assignShift } from "./utils/rosterApi";

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────
  // AUTH LISTENER (SAAS CORE)
  // ─────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ─────────────────────────────
  // LOAD DATA (ONLY IF LOGGED IN)
  // ─────────────────────────────
  async function load() {
    const res = await fetchAutoRoster();
    setData(res);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  // ─────────────────────────────
  // DRAG & DROP ASSIGN
  // ─────────────────────────────
  async function onDragEnd(result) {
    const { destination, draggableId } = result;
    if (!destination) return;

    await assignShift({
      shiftId: Number(destination.droppableId),
      staffName: draggableId
    });

    await load();
  }

  // ─────────────────────────────
  // LOADING STATE
  // ─────────────────────────────
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  // ─────────────────────────────
  // LOGIN GATE (SAAS PROTECTION)
  // ─────────────────────────────
  if (!user) return <Login />;

  if (!data) return <div style={{ padding: 20 }}>Loading roster...</div>;

  // ─────────────────────────────
  // DASHBOARD UI
  // ─────────────────────────────
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={styles.app}>
        <div style={styles.header}>
          <h2>RosterWise SaaS</h2>
          <p>Live Scheduling System</p>
        </div>

        <div style={styles.grid}>
          <StaffPanel staff={data.staff || []} />
          <ShiftBoard roster={data.roster || []} />
        </div>
      </div>
    </DragDropContext>
  );
}

// ─────────────────────────────
// SIMPLE SAAS STYLES
// ─────────────────────────────
const styles = {
  app: {
    fontFamily: "system-ui",
    background: "#f6f7fb",
    minHeight: "100vh",
    padding: 20
  },

  header: {
    background: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 20
  }
};