import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { buildTelHref, trackEvent } from "@/lib/analytics";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useT();

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.rooms"), href: "#rooms" },
    { label: t("nav.amenities"), href: "#amenities" },
    { label: t("nav.gallery"), href: "#gallery" },
    { label: t("nav.reviews"), href: "#reviews" },
    { label: t("nav.faq"), href: "#faq" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  const tel = buildTelHref({ source: "website", medium: "navbar", campaign: "call_now" });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#home" className="flex items-center gap-3">
          <img
            src="/malar_park_logo-removebg.png"
            alt="Malar Park"
            className="h-10 w-auto object-contain"
          />
          <span className="font-heading text-2xl font-bold text-primary">Malar Park</span>
        </a>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle />
          <a href={tel} onClick={() => trackEvent("nav_call_click", { medium: "navbar" })}>
            <Button size="sm" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Phone className="w-4 h-4" /> {t("cta.call")}
            </Button>
          </a>
          <a href="#booking" onClick={() => trackEvent("nav_book_click", { medium: "navbar" })}>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">{t("cta.book")}</Button>
          </a>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button aria-label="Menu" className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-card border-t border-border px-4 pb-4">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3">
            <a href={tel} className="flex-1" onClick={() => trackEvent("nav_call_click", { medium: "navbar_mobile" })}>
              <Button size="sm" variant="outline" className="w-full border-primary text-primary">{t("cta.call")}</Button>
            </a>
            <a href="#booking" className="flex-1" onClick={() => { setOpen(false); trackEvent("nav_book_click", { medium: "navbar_mobile" }); }}>
              <Button size="sm" className="w-full bg-primary text-primary-foreground">{t("cta.book")}</Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
