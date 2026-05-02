import { Phone, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const PHONE = "+918300003829";
const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=Malar+Park,+Tiruvannamalai&destination_place_id=ChIJ_VHwFwDBrDsR6-KLVPQOLw4";
const REVIEWS_URL = "https://search.google.com/local/writereview?placeid=ChIJ_VHwFwDBrDsR6-KLVPQOLw4";
const PROFILE_URL = "https://maps.app.goo.gl/EZeSjsNZx1Tck3zY6";

const GoogleBusinessButtons = () => (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="text-center mb-6">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Find Us on Google</p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Connect with Malar Park
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <a href={`tel:${PHONE}`} onClick={() => trackEvent("gbp_call_click", { source: "gbp_buttons" })}>
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Phone className="w-4 h-4" /> Call Now
          </Button>
        </a>
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("gbp_directions_click", { source: "gbp_buttons" })}
        >
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Navigation className="w-4 h-4" /> Get Directions
          </Button>
        </a>
        <a
          href={REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("gbp_review_click", { source: "gbp_buttons" })}
        >
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Star className="w-4 h-4" /> Leave a Review
          </Button>
        </a>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
          onClick={() => trackEvent("gbp_profile_click", { source: "gbp_buttons" })}
        >
          View our Google Business Profile →
        </a>
      </p>
    </div>
  </section>
);

export default GoogleBusinessButtons;
