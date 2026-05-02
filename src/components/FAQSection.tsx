import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Where is Malar Park Hotel located?",
    a: "Malar Park is at 1852/6, Chengam Main Road, opposite Sri Ramanasramam, Tiruvannamalai – 606601, Tamil Nadu, just 1.5 km from Sri Arunachaleswarar Temple.",
  },
  {
    q: "What are the room prices at Malar Park?",
    a: "Rooms start from ₹1,200/night for Deluxe, ₹1,800 for Family Room and ₹2,500 for the Suite. Prices include taxes and free WiFi.",
  },
  {
    q: "What are the check-in and check-out times?",
    a: "Check-in is from 12:00 PM and check-out is by 11:00 AM. Early check-in is subject to availability.",
  },
  {
    q: "Do you offer free parking and WiFi?",
    a: "Yes. Malar Park provides free on-site parking and complimentary high-speed WiFi for all guests.",
  },
  {
    q: "How can I book a room at Malar Park?",
    a: "You can book instantly via WhatsApp at +91 83000 03829, call us, or fill the booking form on this website.",
  },
  {
    q: "Is the hotel suitable for Girivalam pilgrims?",
    a: "Absolutely. We are right opposite Ramana Ashram and on the Girivalam route, making it ideal for spiritual visitors.",
  },
];

const FAQSection = () => {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">FAQ</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
