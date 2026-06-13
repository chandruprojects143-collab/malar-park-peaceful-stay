import { useEffect, useState } from "react";
import { useT } from "@/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { trackEvent } from "@/lib/analytics";

const Navbar = () => {
  const { t } = useT();
  const [active, setActive] = useState<string>("home");

  const rowOne = [
    { id: "home", label: t("nav.home") },
    { id: "about", label: t("nav.about") },
    { id: "rooms", label: t("nav.rooms") },
    { id: "amenities", label: t("nav.amenities") },
  ];
  const rowTwo = [
    { id: "gallery", label: t("nav.gallery") },
    { id: "reviews", label: t("nav.reviews") },
    { id: "faq", label: t("nav.faq") },
    { id: "contact", label: t("nav.contact") },
  ];
  const all = [...rowOne, ...rowTwo];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 200;
      let current = "home";
      for (const it of all) {
        const el = document.getElementById(it.id);
        if (el && el.offsetTop <= y) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (id: string) => {
    trackEvent("nav_section_click", { section: id });
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderRow = (items: { id: string; label: string }[]) => (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => handleClick(it.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all duration-200 border ${
              isActive
                ? "bg-[#D4A437] text-white border-[#D4A437] shadow-md"
                : "bg-white text-[#0F6B52] border-[#0F6B52]/15 hover:bg-[#0F6B52]/5"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <a href="#home" onClick={(e) => { e.preventDefault(); handleClick("home"); }} className="flex items-center gap-2 min-w-0">
            <img src="/malar_park_logo-removebg.png" alt="Malar Park" className="h-9 w-auto object-contain shrink-0" />
            <span className="font-heading text-lg sm:text-xl font-bold text-primary truncate">Malar Park</span>
          </a>
          <LanguageToggle />
        </div>
        <div className="flex flex-col gap-1.5">
          {renderRow(rowOne)}
          {renderRow(rowTwo)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
