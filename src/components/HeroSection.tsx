import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import { useT } from "@/i18n/LanguageContext";
import { buildTelHref, buildWhatsAppHref, trackEvent } from "@/lib/analytics";

const HeroSection = () => {
  const { t } = useT();
  const tel = buildTelHref({ source: "website", medium: "hero", campaign: "call_now" });
  const wa = buildWhatsAppHref(
    "Hi, I want to book a room at Malar Park",
    { source: "website", medium: "hero", campaign: "whatsapp_enquiry" }
  );
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={heroBanner} alt="Malar Park Hotel exterior at dusk" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-4">{t("hero.welcome")}</p>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
          Malar Park
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 font-light">
          {t("hero.tagline")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#booking" onClick={() => trackEvent("hero_book_click")}>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8">
              {t("cta.book")}
            </Button>
          </a>
          <a href={tel} onClick={() => trackEvent("hero_call_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 backdrop-blur-sm">
              <Phone className="w-4 h-4" /> {t("cta.call")}
            </Button>
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("hero_whatsapp_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 backdrop-blur-sm">
              <MessageCircle className="w-4 h-4" /> {t("hero.whatsappBtn")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
