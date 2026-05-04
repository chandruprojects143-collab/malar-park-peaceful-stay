import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomImageCarousel } from "@/components/RoomsSection";
import { useRooms } from "@/hooks/useRooms";
import { slugify, trackEvent, buildWhatsAppHref } from "@/lib/analytics";
import { useT } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { setSocialMeta } from "@/lib/socialMeta";
import { Wifi, Snowflake, Tv, ShowerHead, Car, BedDouble } from "lucide-react";

const amenities = [
  { icon: Snowflake, key: "amenity.ac" },
  { icon: Wifi, key: "amenity.wifi" },
  { icon: ShowerHead, key: "amenity.hotwater" },
  { icon: Tv, key: "amenity.tv" },
  { icon: BedDouble, key: "amenity.beds" },
  { icon: Car, key: "amenity.parking" },
];

const RoomDetail = () => {
  const { slug } = useParams();
  const rooms = useRooms();
  const { t } = useT();
  const room = rooms.find((r) => slugify(r.name) === slug);

  useEffect(() => {
    if (room) {
      document.title = `${room.name} – ₹${room.price}/night | Malar Park Hotel`;

      // HotelRoom + Offer JSON-LD for rich results
      const data = {
        "@context": "https://schema.org",
        "@type": "HotelRoom",
        name: room.name,
        description: room.desc,
        image: room.images,
        bed: { "@type": "BedDetails", typeOfBed: "Double" },
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
          { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
          { "@type": "LocationFeatureSpecification", name: "Hot Water", value: true },
          { "@type": "LocationFeatureSpecification", name: "LED TV", value: true },
          { "@type": "LocationFeatureSpecification", name: "Free Parking", value: true },
        ],
        offers: {
          "@type": "Offer",
          price: room.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: room.price,
            priceCurrency: "INR",
            unitCode: "DAY",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
          },
        },
        containedInPlace: {
          "@type": "Hotel",
          name: "Malar Park Hotel",
          address: {
            "@type": "PostalAddress",
            streetAddress: "1852/6, Chengam Main Road, Opp Sri Ramanasramam",
            addressLocality: "Tiruvannamalai",
            postalCode: "606601",
            addressRegion: "Tamil Nadu",
            addressCountry: "IN",
          },
        },
      };
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = "jsonld-hotelroom";
      tag.text = JSON.stringify(data);
      document.head.appendChild(tag);
      return () => { tag.remove(); };
    }
  }, [room]);

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Room not found</h1>
        <Link to="/#rooms"><Button>Back to Rooms</Button></Link>
      </div>
    );
  }

  const wa = buildWhatsAppHref(
    `Hi, I want to book the ${room.name} (₹${room.price}/night) at Malar Park.`,
    { source: "website", medium: "room_detail", campaign: "whatsapp", content: slug }
  );

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/#rooms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("nav.rooms")}
          </Link>
          <article itemScope itemType="https://schema.org/Product" className="grid lg:grid-cols-2 gap-8">
            <meta itemProp="name" content={room.name} />
            <div className="rounded-xl overflow-hidden border border-border shadow-elegant">
              <RoomImageCarousel images={room.images} name={room.name} />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">{room.name}</h1>
              <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">
                  <span itemProp="priceCurrency" content="INR">₹</span>
                  <span itemProp="price" content={String(room.price)}>{room.price.toLocaleString()}</span>
                </span>
                <span className="text-sm text-muted-foreground">/ {t("rooms.perNight")}</span>
                <link itemProp="availability" href="https://schema.org/InStock" />
              </div>
              <p className="text-muted-foreground mb-6" itemProp="description">{room.desc}</p>

              <h2 className="font-heading text-lg font-semibold mb-3">{t("nav.amenities")}</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {amenities.map((a) => (
                  <div key={a.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a.icon className="w-4 h-4 text-primary" /> {t(a.key)}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/#booking" className="flex-1">
                  <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => trackEvent("room_book_now", { room: room.name })}>
                    {t("cta.book")}
                  </Button>
                </Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1"
                  onClick={() => trackEvent("room_detail_whatsapp_click", { room: room.name })}>
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" /> {t("cta.whatsapp")}
                  </Button>
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
};

export default RoomDetail;
