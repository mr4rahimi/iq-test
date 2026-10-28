const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Converts Western digits in a string to Persian digits. */
export function fa(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return fa(`${m}:${s.toString().padStart(2, "0")}`);
}
