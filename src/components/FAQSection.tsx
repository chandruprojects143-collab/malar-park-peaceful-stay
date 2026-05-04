import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useT } from "@/i18n/LanguageContext";
import { dict } from "@/i18n/translations";

const faqKeys = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
];

const buildFaqSchema = (lang: "en" | "ta", url: string) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: lang === "ta" ? "ta-IN" : "en-IN",
  "@id": `${url}#faq-${lang}`,
  mainEntity: faqKeys.map(f => ({
    "@type": "Question",
    name: dict[lang][f.q],
    acceptedAnswer: { "@type": "Answer", text: dict[lang][f.a] },
  })),
});

const FAQSection = () => {
  const { t, lang } = useT();

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
    const tags: HTMLScriptElement[] = [];

    // Always emit English FAQPage for canonical indexing
    const enTag = document.createElement("script");
    enTag.type = "application/ld+json";
    enTag.id = "jsonld-faq-en";
    enTag.text = JSON.stringify(buildFaqSchema("en", url));
    document.head.appendChild(enTag);
    tags.push(enTag);

    // Add Tamil FAQPage only when Tamil is active
    if (lang === "ta") {
      const taTag = document.createElement("script");
      taTag.type = "application/ld+json";
      taTag.id = "jsonld-faq-ta";
      taTag.text = JSON.stringify(buildFaqSchema("ta", url));
      document.head.appendChild(taTag);
      tags.push(taTag);
    }

    // Hotel review structured data (language-independent)
    const reviewData = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      name: "Malar Park Hotel",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "120", bestRating: "5" },
      review: [
        { "@type": "Review", author: { "@type": "Person", name: "Rajesh K." }, reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, reviewBody: "Very clean rooms and the location is perfect – right opposite Ramana Ashram." },
        { "@type": "Review", author: { "@type": "Person", name: "Priya R." }, reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, reviewBody: "Best budget hotel in Tiruvannamalai. Perfect for Girivalam." },
      ],
    };
    const reviewTag = document.createElement("script");
    reviewTag.type = "application/ld+json";
    reviewTag.id = "jsonld-hotel-reviews";
    reviewTag.text = JSON.stringify(reviewData);
    document.head.appendChild(reviewTag);
    tags.push(reviewTag);

    return () => tags.forEach(tg => tg.remove());
  }, [lang]);

  return (
    <section id="faq" className="py-20 bg-card">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("faq.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("faq.title")}
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqKeys.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground font-medium">{t(f.q)}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t(f.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
