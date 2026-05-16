const BASE_URL = "http://localhost:3001/api/roster";

export async function fetchAutoRoster() {
  const res = await fetch(`${BASE_URL}/generate`);
  return res.json();
}

export async function assignShift(payload) {
  const res = await fetch(`${BASE_URL}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res.json();
}