import { Phone, Mail, MapPin, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const ContactSection = () => (
  <section id="contact" className="py-20 bg-gradient-primary">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Contact Us</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">
          Get in Touch
        </h2>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5">
            <Phone className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary-foreground">Phone</p>
              <a href="tel:+918300003829" className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">+91 83000 03829</a>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5">
            <Mail className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary-foreground">Email</p>
              <a href="mailto:holidays@malarpark.com" className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">holidays@malarpark.com</a>
              <br />
              <a href="mailto:malarpark01@gmail.com" className="text-primary-foreground/80 text-sm hover:text-secondary transition-colors">malarpark01@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-primary-foreground/10 rounded-xl p-5 mb-8">
          <MapPin className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-primary-foreground">Address</p>
            <p className="text-primary-foreground/80 text-sm">
              1852/6, Chengam Main Road, Opp to Sri Ramanasramam,<br />
              Tiruvannamalai – 606601, Tamil Nadu, India
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="tel:+918300003829" onClick={() => trackEvent("contact_call_click")}>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 w-full sm:w-auto">
              <Phone className="w-4 h-4" /> Call Now
            </Button>
          </a>
          <a href="https://wa.me/918300003829" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_whatsapp_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 w-full sm:w-auto backdrop-blur-sm">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
          </a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=Malar+Park,+1852/6,+Chengam+Road,+TSR+Nagar,+Tiruvannamalai,+Tamil+Nadu+606603&destination_place_id=ChIJ_VHwFwDBrDsR6-KLVPQOLw4" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("contact_directions_click")}>
            <Button size="lg" className="bg-primary-foreground/20 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/30 gap-2 w-full sm:w-auto backdrop-blur-sm">
              <Navigation className="w-4 h-4" /> Get Directions
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
