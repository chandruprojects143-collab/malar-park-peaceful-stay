import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wifi, Snowflake, Tv, ShowerHead, Car, BedDouble, ChevronLeft, ChevronRight, ImageOff, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { slugify, buildWhatsAppHref, trackEvent } from "@/lib/analytics";
import { useT } from "@/i18n/LanguageContext";
import { setSocialMeta } from "@/lib/socialMeta";

export interface RoomPhoto {
  id: string;
  name: string;
  description: string;
  images: string[];
  price?: number;
}

export interface DisplayRoom {
  name: string;
  desc: string;
  images: string[];
  price: number;
}

const amenityIcons = [
  { icon: Snowflake, key: "amenity.ac" },
  { icon: Wifi, key: "amenity.wifi" },
  { icon: ShowerHead, key: "amenity.hotwater" },
  { icon: Tv, key: "amenity.tv" },
  { icon: BedDouble, key: "amenity.beds" },
  { icon: Car, key: "amenity.parking" },
];

const FallbackImage = ({ name }: { name: string }) => (
  <div className="w-full h-56 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
    <ImageOff className="w-8 h-8" />
    <span className="text-xs">{name} — photo coming soon</span>
  </div>
);

export const RoomImageCarousel = ({ images, name }: { images: string[]; name: string }) => {
  const [current, setCurrent] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const valid = images.filter((_, i) => !broken[i]);

  if (!images || images.length === 0 || valid.length === 0) {
    return <FallbackImage name={name} />;
  }
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={name}
        loading="lazy"
        width={800}
        height={600}
        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={() => setBroken({ 0: true })}
      />
    );
  }
  const safeIdx = current % images.length;
  return (
    <div className="relative">
      <img
        src={images[safeIdx]}
        alt={`${name} ${safeIdx + 1}`}
        loading="lazy"
        width={800}
        height={600}
        className="w-full h-56 object-cover"
        onError={() => setBroken(prev => ({ ...prev, [safeIdx]: true }))}
      />
      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => { e.preventDefault(); setCurrent((safeIdx - 1 + images.length) % images.length); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 rounded-full h-11 w-11 flex items-center justify-center hover:bg-background transition-colors shadow-md active:scale-95"
      >
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => { e.preventDefault(); setCurrent((safeIdx + 1) % images.length); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 rounded-full h-11 w-11 flex items-center justify-center hover:bg-background transition-colors shadow-md active:scale-95"
      >
        <ChevronRight className="w-6 h-6 text-foreground" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 py-2">
        {images.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === safeIdx}
            onClick={(e) => { e.preventDefault(); setCurrent(i); }}
            className="h-9 w-9 flex items-center justify-center"
          >
            <span className={`block rounded-full transition-all ring-2 ring-background/60 ${i === safeIdx ? 'bg-primary w-3.5 h-3.5' : 'bg-background/80 w-3 h-3'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export const RoomCard = ({ room }: { room: DisplayRoom }) => {
  const { t } = useT();
  const wa = buildWhatsAppHref(
    `Hi, I want to enquire about the ${room.name} (₹${room.price}/night)`,
    { source: "website", medium: "room_card", campaign: "whatsapp", content: slugify(room.name) }
  );
  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="bg-card rounded-xl overflow-hidden shadow-elegant border border-border group"
    >
      <meta itemProp="name" content={room.name} />
      <meta itemProp="description" content={room.desc} />
      <div className="overflow-hidden">
        <RoomImageCarousel images={room.images} name={room.name} />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading text-xl font-bold text-foreground" itemProp="name">{room.name}</h3>
          <div
            className="text-right"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <p className="text-lg font-bold text-primary leading-tight">
              <span itemProp="priceCurrency" content="INR">₹</span>
              <span itemProp="price" content={String(room.price)}>{room.price.toLocaleString()}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{t("rooms.perNight")}</p>
            <link itemProp="availability" href="https://schema.org/InStock" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{room.desc}</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {amenityIcons.map((a) => (
            <div key={a.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <a.icon className="w-3.5 h-3.5 text-primary" />
              {t(a.key)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={`/rooms/${slugify(room.name)}`} className="flex-1 min-w-0" onClick={() => trackEvent("room_view_details", { room: room.name })}>
            <Button variant="outline" className="w-full" size="sm">{t("cta.viewDetails")}</Button>
          </Link>
          <a href="#booking" className="flex-1 min-w-0" onClick={() => trackEvent("room_book_click", { room: room.name })}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">{t("cta.book")}</Button>
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0"
            onClick={() => trackEvent("room_whatsapp_click", { room: room.name })}>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" size="sm">
              <MessageCircle className="w-3.5 h-3.5 mr-1" />{t("cta.whatsapp")}
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
};

const RoomsSection = () => {
  const { t } = useT();
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    type RoomRow = {
      number: number;
      type: string;
      description?: string | null;
      rate?: number | null;
      images?: string[] | null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('hotel_rooms')
      .select('number, type, description, rate, images')
      .order('number')
      .then((res: any) => {
        const data = res.data as RoomRow[] | null;
        if (data && data.length > 0) {
          setRooms(data.map(r => ({
            name: `${r.type} Room`,
            desc: r.description ?? '',
            images: r.images ?? [],
            price: r.rate ?? 0,
          })));
        }
        setLoading(false);
      });
  }, []);

  const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0;

  useEffect(() => {
    const imgs = rooms.flatMap(r => r.images).filter(Boolean).slice(0, 4);
    if (imgs.length === 0) return;
    const cleanup = setSocialMeta({
      images: imgs,
      url: typeof window !== "undefined" ? window.location.origin + "/" : undefined,
    });
    return cleanup;
  }, [rooms]);

  if (loading) return null;

  return (
    <section id="rooms" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("rooms.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {t("rooms.title")}
          </h2>
          {minPrice > 0 && (
            <p className="mt-3 text-muted-foreground">
              {t("rooms.startsFrom")} <span className="font-bold text-primary">₹{minPrice.toLocaleString()}/{t("rooms.perNight")}</span>
            </p>
          )}
        </div>
        {rooms.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.name} room={room} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">Rooms details coming soon.</p>
        )}
      </div>
    </section>
  );
};

export default RoomsSection;
