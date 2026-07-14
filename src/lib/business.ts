export const BUSINESS = {
  name: "Bruno Eduardo Avi",
  tagline: "Assistência Técnica em Informática",
  whatsapp: "5547988992553",
  whatsappDisplay: "(47) 98899-2553",
  email: "tech.brunoeduardoavi2026@gmail.com",
  city: "Santa Catarina",
} as const;

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${BUSINESS.whatsapp}${text}`;
}
