import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomImageCarousel } from "@/components/RoomsSection";
import { useRooms } from "@/hooks/useRooms";
import { slugify, trackEvent } from "@/lib/analytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { Wifi, Snowflake, Tv, ShowerHead, Car, BedDouble } from "lucide-react";

const amenities = [
  { icon: Snowflake, label: "AC / Non AC" },
  { icon: Wifi, label: "Free WiFi" },
  { icon: ShowerHead, label: "Hot Water" },
  { icon: Tv, label: "LED TV" },
  { icon: BedDouble, label: "Comfortable Beds" },
  { icon: Car, label: "Free Parking" },
];

const RoomDetail = () => {
  const { slug } = useParams();
  const rooms = useRooms();
  const room = rooms.find(r => slugify(r.name) === slug);

  useEffect(() => {
    if (room) {
      document.title = `${room.name} – ₹${room.price}/night | Malar Park Hotel`;
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

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/#rooms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> All Rooms
          </Link>
          <article itemScope itemType="https://schema.org/Product" className="grid lg:grid-cols-2 gap-8">
            <meta itemProp="name" content={room.name} />
            <div className="rounded-xl overflow-hidden border border-border shadow-elegant">
              <RoomImageCarousel images={room.images} name={room.name} />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">{room.name}</h1>
              <div
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
                className="flex items-baseline gap-2 mb-4"
              >
                <span className="text-3xl font-bold text-primary">
                  <span itemProp="priceCurrency" content="INR">₹</span>
                  <span itemProp="price" content={String(room.price)}>{room.price.toLocaleString()}</span>
                </span>
                <span className="text-sm text-muted-foreground">/ night</span>
                <link itemProp="availability" href="https://schema.org/InStock" />
              </div>
              <p className="text-muted-foreground mb-6" itemProp="description">{room.desc}</p>

              <h2 className="font-heading text-lg font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {amenities.map(a => (
                  <div key={a.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a.icon className="w-4 h-4 text-primary" /> {a.label}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/#booking" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => trackEvent("room_book_now", { room: room.name })}
                  >
                    Book Now
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/918300003829?text=${encodeURIComponent(`Hi, I want to book the ${room.name} (₹${room.price}/night) at Malar Park.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={() => trackEvent("room_whatsapp_click", { room: room.name })}
                >
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
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
