import { Phone, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent, buildTelHref, buildDirectionsHref, buildReviewsHref, appendUtm, GBP_PROFILE_BASE } from "@/lib/analytics";
import { useT } from "@/i18n/LanguageContext";

const GoogleBusinessButtons = () => {
  const { t } = useT();
  const tel = buildTelHref({ source: "website", medium: "gbp_buttons", campaign: "call" });
  const dir = buildDirectionsHref({ source: "website", medium: "gbp_buttons", campaign: "directions" });
  const rev = buildReviewsHref({ source: "website", medium: "gbp_buttons", campaign: "review" });
  const profile = appendUtm(GBP_PROFILE_BASE, { source: "website", medium: "gbp_buttons", campaign: "profile" });
  return (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="text-center mb-6">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("gbp.kicker")}</p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("gbp.title")}
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <a href={tel} onClick={() => trackEvent("gbp_call_click", { source: "gbp_buttons" })}>
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Phone className="w-4 h-4" /> {t("cta.call")}
          </Button>
        </a>
        <a href={dir} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("gbp_directions_click", { source: "gbp_buttons" })}>
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Navigation className="w-4 h-4" /> {t("cta.directions")}
          </Button>
        </a>
        <a href={rev} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("gbp_review_click", { source: "gbp_buttons" })}>
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Star className="w-4 h-4" /> {t("cta.review")}
          </Button>
        </a>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        <a href={profile} target="_blank" rel="noopener noreferrer" className="hover:text-primary"
          onClick={() => trackEvent("gbp_profile_click", { source: "gbp_buttons" })}>
          {t("gbp.profile")}
        </a>
      </p>
    </div>
  </section>
  );
};

export default GoogleBusinessButtons;
