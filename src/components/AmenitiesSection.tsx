import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";
import { useAmenitiesDb } from "@/hooks/useCms";

const fallback = [
  { icon: "Wifi", key: "amenity.wifi" },
  { icon: "AirVent", key: "amenity.acrooms" },
  { icon: "Phone", key: "amenity.frontdesk" },
  { icon: "ShieldCheck", key: "amenity.security" },
  { icon: "Camera", key: "amenity.cctv" },
  { icon: "Zap", key: "amenity.power" },
  { icon: "ArrowUpDown", key: "amenity.lift" },
  { icon: "ClipboardCheck", key: "amenity.express" },
  { icon: "CigaretteOff", key: "amenity.nosmoking" },
  { icon: "Sparkles", key: "amenity.housekeeping" },
  { icon: "ConciergeBell", key: "amenity.roomservice" },
  { icon: "WashingMachine", key: "amenity.laundry" },
  { icon: "AlarmClock", key: "amenity.wakecall" },
  { icon: "KeyRound", key: "amenity.privatecheckin" },
  { icon: "ShowerHead", key: "amenity.hotwater" },
  { icon: "Tv", key: "amenity.tv" },
  { icon: "VolumeX", key: "amenity.soundproof" },
  { icon: "Sunset", key: "amenity.balcony" },
  { icon: "MapPin", key: "amenity.travel" },
  { icon: "Flame", key: "amenity.firesafety" },
];

const AmenitiesSection = () => {
  const { t } = useT();
  const { data: db = [] } = useAmenitiesDb();
  const enabled = db.filter((a: any) => a.enabled);
  const items = enabled.length > 0
    ? enabled.map((a: any) => ({ icon: a.icon || "Star", title: a.title }))
    : fallback.map(f => ({ icon: f.icon, title: t(f.key) }));

  return (
    <section id="amenities" className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("amenities.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
            {t("amenities.title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {items.map((a: any, i: number) => {
            const Icon = (Icons as any)[a.icon] ?? Sparkles;
            return (
              <div key={i} className="flex flex-col items-center gap-3 bg-primary-foreground/10 backdrop-blur rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
                <Icon className="w-8 h-8 text-secondary" />
                <span className="text-primary-foreground text-sm font-medium text-center">{a.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
