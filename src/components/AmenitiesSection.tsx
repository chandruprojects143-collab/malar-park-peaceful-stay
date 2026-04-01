import { Wifi, Clock, Car, Sparkles, ShowerHead, Building, Users, MapPin } from "lucide-react";

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Clock, label: "24×7 Reception" },
  { icon: Car, label: "Car Parking" },
  { icon: Sparkles, label: "Housekeeping" },
  { icon: ShowerHead, label: "Hot Water" },
  { icon: Building, label: "Lift Access" },
  { icon: Users, label: "Family Friendly" },
  { icon: MapPin, label: "Travel Assistance" },
];

const AmenitiesSection = () => (
  <section id="amenities" className="py-20 bg-gradient-primary">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Amenities</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
          Everything You Need
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        {amenities.map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-3 bg-primary-foreground/10 backdrop-blur rounded-xl p-6 hover:bg-primary-foreground/20 transition-colors">
            <a.icon className="w-8 h-8 text-secondary" />
            <span className="text-primary-foreground text-sm font-medium text-center">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AmenitiesSection;
