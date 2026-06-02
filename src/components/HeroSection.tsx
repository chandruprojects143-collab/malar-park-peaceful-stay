import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useT } from "@/i18n/LanguageContext";
import { buildTelHref, buildWhatsAppHref, trackEvent } from "@/lib/analytics";
import { useHeroSlides } from "@/hooks/useCms";

interface Slide {
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
}

const HeroSection = () => {
  const { t } = useT();
  const { data: dbSlides = [] } = useHeroSlides();
  const enabled = dbSlides.filter((s: any) => s.enabled);
  const slides: Slide[] = enabled.length > 0
    ? enabled
    : [{ image_url: heroBanner, title: "Malar Park", subtitle: t("hero.tagline"), cta_label: t("cta.book"), cta_href: "#booking" }];

  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIdx(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  useEffect(() => {
    if (!embla || slides.length <= 1) return;
    const id = setInterval(() => embla.scrollNext(), 6000);
    return () => clearInterval(id);
  }, [embla, slides.length]);

  const tel = buildTelHref({ source: "website", medium: "hero", campaign: "call_now" });
  const wa = buildWhatsAppHref("Hi, I want to book a room at Malar Park",
    { source: "website", medium: "hero", campaign: "whatsapp_enquiry" });

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="relative flex-[0_0_100%] h-screen">
              <img src={s.image_url} alt={s.title ?? "Malar Park Hotel"} className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-4">{t("hero.welcome")}</p>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
          {slides[idx]?.title ?? "Malar Park"}
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 font-light">
          {slides[idx]?.subtitle ?? t("hero.tagline")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={slides[idx]?.cta_href ?? "#booking"} onClick={() => trackEvent("hero_book_click")}>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8">
              {slides[idx]?.cta_label ?? t("cta.book")}
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

        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-secondary" : "w-2 bg-primary-foreground/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
