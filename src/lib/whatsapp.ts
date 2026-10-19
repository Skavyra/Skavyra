export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits.length >= 11 ? digits : null;
}

export function whatsappLink(message?: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
}

export const WHATSAPP_DEFAULT_MESSAGE = "Hi Skavyra, I'd like to know more about your courses.";
