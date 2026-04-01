import { CheckCircle } from "lucide-react";

const highlights = [
  "Clean & well-maintained rooms",
  "Walkable distance to Sri Ramana Ashram",
  "Calm & peaceful environment",
  "Budget friendly premium stay",
  "Friendly staff & warm hospitality",
  "Ideal for Girivalam visitors",
];

const AboutSection = () => (
  <section id="about" className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">About Us</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
          Experience Spiritual Hospitality at Malar Park
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nestled opposite Sri Ramanasramam on Chengam Main Road, Malar Park offers a serene retreat for pilgrims, families, and travelers visiting the sacred town of Tiruvannamalai. Our hotel combines premium comfort with budget-friendly pricing, ensuring every guest feels at home while exploring the spiritual heart of Arunachala.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {highlights.map((h) => (
          <div key={h} className="flex items-center gap-3 bg-muted rounded-lg p-4">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground text-sm font-medium">{h}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
