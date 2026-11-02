export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
