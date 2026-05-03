import { Wifi, Clock, Car, Sparkles, ShowerHead, Building, Users, MapPin } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

const items = [
  { icon: Wifi, key: "amenity.wifi" },
  { icon: Clock, key: "amenity.reception" },
  { icon: Car, key: "amenity.car" },
  { icon: Sparkles, key: "amenity.housekeeping" },
  { icon: ShowerHead, key: "amenity.hotwater" },
  { icon: Building, key: "amenity.lift" },
  { icon: Users, key: "amenity.family" },
  { icon: MapPin, key: "amenity.travel" },
];

const AmenitiesSection = () => {
  const { t } = useT();
  return (
    <section id="amenities" className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("amenities.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
            {t("amenities.title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {items.map((a) => (
            <div key={a.key} className="flex flex-col items-center gap-3 bg-primary-foreground/10 backdrop-blur rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
              <a.icon className="w-8 h-8 text-secondary" />
              <span className="text-primary-foreground text-sm font-medium text-center">{t(a.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
