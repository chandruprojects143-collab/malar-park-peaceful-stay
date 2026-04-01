import heroBanner from "@/assets/hero-banner.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomFamily from "@/assets/room-family.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import reception from "@/assets/gallery-reception.jpg";
import parking from "@/assets/gallery-parking.jpg";

const images = [
  { src: heroBanner, alt: "Malar Park Hotel Exterior" },
  { src: roomDeluxe, alt: "Deluxe Room" },
  { src: roomFamily, alt: "Family Room" },
  { src: roomSuite, alt: "Suite Room" },
  { src: reception, alt: "Reception Area" },
  { src: parking, alt: "Parking Facility" },
];

const GallerySection = () => (
  <section id="gallery" className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Gallery</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          A Glimpse of Malar Park
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.alt} className="rounded-xl overflow-hidden group">
            <img src={img.src} alt={img.alt} loading="lazy" width={800} height={600} className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
