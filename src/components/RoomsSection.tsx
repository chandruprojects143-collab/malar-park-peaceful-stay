import { Wifi, Snowflake, Tv, ShowerHead, Car, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomFamily from "@/assets/room-family.jpg";
import roomSuite from "@/assets/room-suite.jpg";

const amenityIcons = [
  { icon: Snowflake, label: "AC / Non AC" },
  { icon: Wifi, label: "Free WiFi" },
  { icon: ShowerHead, label: "Hot Water" },
  { icon: Tv, label: "LED TV" },
  { icon: BedDouble, label: "Comfortable Beds" },
  { icon: Car, label: "Parking" },
];

const rooms = [
  { name: "Deluxe Room", desc: "Cozy and clean room perfect for solo travelers and couples.", img: roomDeluxe },
  { name: "Family Room", desc: "Spacious room ideal for families with extra beds and amenities.", img: roomFamily },
  { name: "Suite Room", desc: "Premium suite with sitting area for a luxurious yet affordable stay.", img: roomSuite },
];

const RoomsSection = () => (
  <section id="rooms" className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Our Rooms</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Choose Your Perfect Stay
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.name} className="bg-card rounded-xl overflow-hidden shadow-elegant border border-border group">
            <div className="overflow-hidden">
              <img src={room.img} alt={room.name} loading="lazy" width={800} height={600} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">{room.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{room.desc}</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {amenityIcons.map((a) => (
                  <div key={a.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <a.icon className="w-3.5 h-3.5 text-primary" />
                    {a.label}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <a href="#booking" className="flex-1">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">Book Now</Button>
                </a>
                <a href="https://wa.me/918300003829?text=Hi%2C%20I%20want%20to%20enquire%20about%20the%20room" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="sm">View Room</Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RoomsSection;
