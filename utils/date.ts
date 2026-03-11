export function formatAppointmentDate(dateString: string): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid date";

  // Format as "day month year" in Arabic
  return date.toLocaleDateString("ar-QA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}