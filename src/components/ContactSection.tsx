import { Phone, Mail, MapPin, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent, buildTelHref, buildWhatsAppHref, buildDirectionsHref } from "@/lib/analytics";
import { useT } from "@/i18n/LanguageContext";

const ContactSection = () => {
  const { t } = useT();
  const tel = buildTelHref({ source: "website", medium: "contact", campaign: "call_now" });
  const wa = buildWhatsAppHref("Hi, I want to enquire about Malar Park", { source: "website", medium: "contact", campaign: "whatsapp" });
  const dir = buildDirectionsHref({ source: "website", medium: "contact", campaign: "directions" });
  return (
  <section id="contact" className="py-20 bg-gradient-primary">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("contact.kicker")}</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
          {t("contact.title")}
        </h2>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5">
            <Phone className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary-foreground">{t("contact.phone")}</p>
              <a href={tel} className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">+91 83000 03829</a>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5">
            <Mail className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary-foreground">{t("contact.email")}</p>
              <a href="mailto:holidays@malarpark.com" className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">holidays@malarpark.com</a>
              <br />
              <a href="mailto:malarpark01@gmail.com" className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">malarpark01@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5 mb-8">
          <MapPin className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary-foreground">{t("contact.address")}</p>
            <p className="text-primary-foreground/80 text-sm">{t("contact.addrLine")}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={tel} onClick={() => trackEvent("contact_call_click")}>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 w-full sm:w-auto">
              <Phone className="w-4 h-4" /> {t("cta.call")}
            </Button>
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_whatsapp_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 w-full sm:w-auto backdrop-blur-sm">
              <MessageCircle className="w-4 h-4" /> {t("cta.whatsapp")}
            </Button>
          </a>
          <a href={dir} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_directions_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 w-full sm:w-auto backdrop-blur-sm">
              <Navigation className="w-4 h-4" /> {t("cta.directions")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
  );
};

export default ContactSection;
