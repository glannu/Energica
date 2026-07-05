import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP = "918605657016";
const PHONE = "+917083898947";

// Sticky, always-visible contact buttons. Rendered globally so buyers can
// reach WhatsApp / phone from any page in one tap. Purely additive UI.
export default function FloatingContact() {
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    "Hello Glannu, I have an enquiry about your solar products."
  )}`;

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col gap-3"
      data-testid="floating-contact"
    >
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Glannu on WhatsApp"
        data-testid="floating-whatsapp"
        className="flex items-center gap-2 rounded-full bg-brand-whatsapp text-white shadow-lg shadow-black/20 px-4 py-3 font-semibold text-sm hover:brightness-110 hover:scale-105 transition-all"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline whitespace-nowrap">Chat on WhatsApp</span>
      </a>
      <a
        href={`tel:${PHONE}`}
        aria-label="Call Glannu"
        data-testid="floating-call"
        className="flex items-center gap-2 rounded-full bg-brand-primary text-white shadow-lg shadow-black/20 px-4 py-3 font-semibold text-sm hover:bg-brand-primary-hover hover:scale-105 transition-all"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden sm:inline whitespace-nowrap">Call Us</span>
      </a>
    </div>
  );
}
