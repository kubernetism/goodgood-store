/** Normalize a WhatsApp recipient number to E.164 without guessing non-Pakistani country codes. */
export function normalizeWhatsappNumber(input: string): string | null {
  const value = input.trim().replace(/[\s().-]/g, "");
  const pakistan = /^(?:0|\+92|0092|92)(3\d{9})$/.exec(value);
  if (pakistan) return `+92${pakistan[1]}`;
  const international = value.startsWith("00") ? `+${value.slice(2)}` : value;
  return /^\+[1-9]\d{7,14}$/.test(international) ? international : null;
}
