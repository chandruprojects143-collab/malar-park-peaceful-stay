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

const FAQSection = () => {
  const { t } = useT();

  useEffect(() => {
    // Always emit JSON-LD in English for Google indexing
    const en = dict.en;
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqKeys.map(f => ({
        "@type": "Question",
        name: en[f.q],
        acceptedAnswer: { "@type": "Answer", text: en[f.a] },
      })),
    };
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
    const tags: HTMLScriptElement[] = [];
    [data, reviewData].forEach((d, i) => {
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = `jsonld-faq-${i}`;
      tag.text = JSON.stringify(d);
      document.head.appendChild(tag);
      tags.push(tag);
    });
    return () => tags.forEach(t => t.remove());
  }, []);

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
