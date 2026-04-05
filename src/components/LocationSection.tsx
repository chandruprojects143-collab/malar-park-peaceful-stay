import { MapPin } from "lucide-react";

const nearbyPlaces = [
  { name: "Sri Arunachaleswarar Temple", distance: "1.5 km" },
  { name: "Sri Ramana Ashram", distance: "Opposite" },
  { name: "Girivalam Path", distance: "Walking distance" },
  { name: "Main Road Access", distance: "On Chengam Main Road" },
];

const LocationSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Location</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Perfectly Located
        </h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <div className="space-y-4 mb-6">
            {nearbyPlaces.map((p) => (
              <div key={p.name} className="flex items-center gap-3 bg-muted rounded-lg p-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.distance}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            1852/6, Chengam Main Road, Opp to Sri Ramanasramam, Tiruvannamalai – 606601, Tamil Nadu, India
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-elegant border border-border">
          <iframe
            title="Malar Park Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d79.055427!3d12.223030!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDEzJzIyLjkiTiA3OcKwMDMnMTkuNSJF!5e0!3m2!1sen!2sin!4v1700000000000"
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

export default LocationSection;
