import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | signup

  async function handleAuth() {
    setLoading(true);

    let result;

    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password
      });
    }

    setLoading(false);

    if (result.error) {
      alert(result.error.message);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{mode === "login" ? "Login" : "Create Account"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleAuth} style={styles.button}>
          {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
          style={styles.switch}
        >
          {mode === "login"
            ? "Create account"
            : "Already have account? Login"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f6f7fb"
  },
  card: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    width: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },
  switch: {
    marginTop: 10,
    fontSize: 12,
    color: "#555",
    cursor: "pointer"
  }
};