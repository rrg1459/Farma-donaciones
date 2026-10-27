export const initials = (fullName: string) => {
  return fullName?.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "";
};