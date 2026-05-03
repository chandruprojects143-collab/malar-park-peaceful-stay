import { Phone, MessageCircle } from "lucide-react";
import { trackEvent, buildTelHref, buildWhatsAppHref } from "@/lib/analytics";

const FloatingButtons = () => {
  const wa = buildWhatsAppHref("Hi, I want to book a room at Malar Park", { source: "website", medium: "floating", campaign: "whatsapp" });
  const tel = buildTelHref({ source: "website", medium: "floating", campaign: "call" });
  return (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <a href={wa} target="_blank" rel="noopener noreferrer"
      className="w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp" onClick={() => trackEvent("floating_whatsapp_click")}>
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </a>
    <a href={tel}
      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Call Now" onClick={() => trackEvent("floating_call_click")}>
      <Phone className="w-6 h-6 text-primary-foreground" />
    </a>
  </div>
  );
};

export default FloatingButtons;
