import { Star } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";
import { useReviewsDb } from "@/hooks/useCms";

const ReviewsSection = () => {
  const { t } = useT();
  const { data: db = [] } = useReviewsDb();
  const reviews = (db as any[]).filter(r => r.enabled);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("reviews.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("reviews.title")}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((r: any, i: number) => (
            <div key={r.id ?? i} className="bg-card rounded-xl p-6 border border-border shadow-elegant">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm mb-4 italic">"{r.text}"</p>
              <p className="font-heading font-semibold text-foreground">{r.guest_name}</p>
              {r.country && <p className="text-xs text-muted-foreground mt-1">{r.country}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
