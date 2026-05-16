export function parseStaff(row) {
  return {
    ...row,
    skills: JSON.parse(row.skills || "[]"),
    availability: JSON.parse(row.availability || "[]")
  };
}