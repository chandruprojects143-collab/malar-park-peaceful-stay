import { MapPin } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

const places = [
  { nameKey: "loc.temple", distKey: "1.5 km" },
  { nameKey: "loc.ashram", distKey: "loc.dist.opposite" },
  { nameKey: "loc.giri", distKey: "loc.dist.walk" },
  { nameKey: "loc.road", distKey: "loc.dist.road" },
];

const LocationSection = () => {
  const { t } = useT();
  const tx = (k: string) => (k.includes(".") ? t(k) : k);
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("loc.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("loc.title")}
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="space-y-4 mb-6">
              {places.map((p) => (
                <div key={p.nameKey} className="flex items-center gap-3 bg-muted rounded-lg p-4">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{t(p.nameKey)}</p>
                    <p className="text-sm text-muted-foreground">{tx(p.distKey)}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">{t("contact.addrLine")}</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-elegant border border-border">
            <iframe
              title="Malar Park Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.5!2d79.0677!3d12.2309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bacc10017f051fd%3A0xe12f0ef4548be2eb!2sMalar%20Park!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
