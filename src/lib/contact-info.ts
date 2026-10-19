const configuredEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();
const emailCandidate = configuredEmail || "skavyratechnologies@gmail.com";
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCandidate) ? emailCandidate : null;

const rawPhone = (process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "").trim();
const phoneDigits = rawPhone.replace(/\D/g, "");
const validPhone = /^[\d+\s]+$/.test(rawPhone) && /[1-9]/.test(phoneDigits);
const phone = validPhone
  ? phoneDigits.length === 10
    ? `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
    : rawPhone
  : null;
const phoneHref = validPhone
  ? `tel:+${phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits}`
  : null;

const rawInstagramUrl = (process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "").trim();
let instagramUrl: string | null = null;
if (rawInstagramUrl.startsWith("https://")) {
  try {
    const parsedInstagramUrl = new URL(rawInstagramUrl);
    if (parsedInstagramUrl.protocol === "https:") instagramUrl = rawInstagramUrl;
  } catch {
    instagramUrl = null;
  }
}
const addressValue = (process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "").trim();

export const CONTACT = {
  email,
  phone,
  phoneHref,
  instagramUrl,
  address: addressValue || null,
};
