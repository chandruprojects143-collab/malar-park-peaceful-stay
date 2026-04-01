import { Star } from "lucide-react";

const reviews = [
  { name: "Rajesh K.", text: "Very clean rooms and the location is perfect – right opposite Ramana Ashram. Will definitely visit again!", rating: 5 },
  { name: "Meena S.", text: "Helpful staff who went out of their way to make our family comfortable. Great value for money.", rating: 5 },
  { name: "David W.", text: "Peaceful location, ideal for spiritual seekers. The rooms are well maintained and the WiFi works great.", rating: 4 },
  { name: "Priya R.", text: "Best budget hotel in Tiruvannamalai. Perfect for Girivalam. Hot water and clean bathrooms. Highly recommend!", rating: 5 },
];

const ReviewsSection = () => (
  <section id="reviews" className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Guest Reviews</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          What Our Guests Say
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((r) => (
          <div key={r.name} className="bg-card rounded-xl p-6 border border-border shadow-elegant">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
              ))}
            </div>
            <p className="text-muted-foreground text-sm mb-4 italic">"{r.text}"</p>
            <p className="font-heading font-semibold text-foreground">{r.name}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ReviewsSection;
