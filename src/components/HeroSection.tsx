import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => (
  <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img src={heroBanner} alt="Malar Park Hotel exterior at dusk" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
    <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
    <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
      <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-4">Welcome to</p>
      <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight">
        Malar Park
      </h1>
      <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 font-light">
        Comfortable Stay Near Arunachala – Feel Peace Like Home
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="#booking">
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8">
            Book Now
          </Button>
        </a>
        <a href="tel:+918300003829">
          <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
            <Phone className="w-4 h-4" /> Call Now
          </Button>
        </a>
        <a href="https://wa.me/918300003829?text=Hi%2C%20I%20want%20to%20book%20a%20room%20at%20Malar%20Park" target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp Enquiry
          </Button>
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;
