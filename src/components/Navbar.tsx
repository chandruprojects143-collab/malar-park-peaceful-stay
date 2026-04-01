import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#home" className="font-heading text-2xl font-bold text-primary">
          Malar Park
        </a>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <a href="tel:+918300003829">
            <Button size="sm" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Phone className="w-4 h-4" /> Call Now
            </Button>
          </a>
          <a href="#booking">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Book Now</Button>
          </a>
        </div>
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-card border-t border-border px-4 pb-4">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3">
            <a href="tel:+918300003829" className="flex-1">
              <Button size="sm" variant="outline" className="w-full border-primary text-primary">Call Now</Button>
            </a>
            <a href="#booking" className="flex-1" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full bg-primary text-primary-foreground">Book Now</Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
