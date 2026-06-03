import { useEffect, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useT } from "@/i18n/LanguageContext";
import { dict } from "@/i18n/translations";
import { useFaqsDb } from "@/hooks/useCms";

// Static fallback keys (used when DB has no enabled FAQs yet)
export const faqKeys = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
];

interface FaqEntry { question: string; answer: string; }

export const buildFaqSchemaFromEntries = (entries: FaqEntry[], lang: "en" | "ta", url: string) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: lang === "ta" ? "ta-IN" : "en-IN",
  "@id": `${url}#faq-${lang}`,
  mainEntity: entries.map(e => ({
    "@type": "Question",
    name: e.question,
    acceptedAnswer: { "@type": "Answer", text: e.answer.replace(/<[^>]+>/g, "") },
  })),
});

// Back-compat for any caller still importing buildFaqSchema
export const buildFaqSchema = (lang: "en" | "ta", url: string) =>
  buildFaqSchemaFromEntries(
    faqKeys.map(f => ({ question: dict[lang][f.q], answer: dict[lang][f.a] })),
    lang,
    url,
  );

const FAQSection = () => {
  const { t, lang } = useT();
  const { data: dbFaqs = [], isLoading } = useFaqsDb();

  const entries: FaqEntry[] = useMemo(() => {
    const enabled = (dbFaqs as any[])
      .filter(f => f.enabled)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(f => ({ question: f.question, answer: f.answer_html || "" }));
    if (enabled.length > 0) return enabled;
    return faqKeys.map(f => ({ question: dict[lang][f.q], answer: dict[lang][f.a] }));
  }, [dbFaqs, lang]);

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
    const tags: HTMLScriptElement[] = [];

    const addTag = (id: string, payload: any) => {
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = id;
      tag.text = JSON.stringify(payload);
      document.head.appendChild(tag);
      tags.push(tag);
    };

    addTag("jsonld-faq-en", buildFaqSchemaFromEntries(entries, "en", url));
    if (lang === "ta") addTag("jsonld-faq-ta", buildFaqSchemaFromEntries(entries, "ta", url));

    addTag("jsonld-hotel-reviews", {
      "@context": "https://schema.org",
      "@type": "Hotel",
      name: "Malar Park Hotel",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "120", bestRating: "5" },
      review: [
        { "@type": "Review", author: { "@type": "Person", name: "Rajesh K." }, reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, reviewBody: "Very clean rooms and the location is perfect – right opposite Ramana Ashram." },
        { "@type": "Review", author: { "@type": "Person", name: "Priya R." }, reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, reviewBody: "Best budget hotel in Tiruvannamalai. Perfect for Girivalam." },
      ],
    });

    return () => tags.forEach(tg => tg.remove());
  }, [lang, entries]);

  return (
    <section id="faq" className="py-20 bg-card">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("faq.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("faq.title")}
          </h2>
        </div>
        {isLoading && entries.length === 0 ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {entries.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: f.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
