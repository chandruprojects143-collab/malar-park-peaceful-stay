import { Phone, MessageCircle } from "lucide-react";

const FloatingButtons = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <a
      href="https://wa.me/918300003829?text=Hi%2C%20I%20want%20to%20book%20a%20room%20at%20Malar%20Park"
      target="_blank"
      rel="noopener noreferrer"
      className="w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
    <a
      href="tel:+918300003829"
      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Call Now"
    >
      <Phone className="w-6 h-6 text-primary-foreground" />
    </a>
  </div>
);

export default FloatingButtons;
