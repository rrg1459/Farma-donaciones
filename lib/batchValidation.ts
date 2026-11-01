export const MIN_EXPIRATION_DAYS = 7;

export function getDateAfterDays(days: number, now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMinimumExpirationDate(now = new Date()): string {
  return getDateAfterDays(MIN_EXPIRATION_DAYS, now);
}

export function parseExpirationDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(Number(yearText), Number(monthText) - 1, Number(dayText));

  if (
    Number(yearText) < 1 ||
    date.getUTCFullYear() !== Number(yearText) ||
    date.getUTCMonth() !== Number(monthText) - 1 ||
    date.getUTCDate() !== Number(dayText)
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export function isValidISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(Number(yearText), Number(monthText) - 1, Number(dayText));

  return (
    Number(yearText) > 0 &&
    date.getUTCFullYear() === Number(yearText) &&
    date.getUTCMonth() === Number(monthText) - 1 &&
    date.getUTCDate() === Number(dayText)
  );
}

export function isValidExpirationDate(value: string, now = new Date()): boolean {
  return isValidISODate(value) && value >= getMinimumExpirationDate(now);
}

export function formatExpirationDate(value: string): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function getMinimumInitialQuantity(
  initialQuantity: number,
  currentQuantity: number,
): number {
  return Math.max(initialQuantity, currentQuantity);
}
