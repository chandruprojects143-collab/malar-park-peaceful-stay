import { useMemo, useState } from "react";
import { CalendarIcon, MessageCircle, Plus, Minus, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, eachDayOfInterval, differenceInCalendarDays, addDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useUnavailableDates, useRooms, usePerRoomUnavailable } from "@/hooks/useRooms";
import { toast } from "sonner";
import { trackEvent, buildWhatsAppHref } from "@/lib/analytics";
import { useT } from "@/i18n/LanguageContext";
import { downloadBookingPdf, type BookingPdfData } from "@/lib/bookingPdf";

// Infer a sensible capacity from room name (defaults to 2)
const inferCapacity = (name: string): number => {
  const n = name.toLowerCase();
  if (n.includes("suite")) return 5;
  if (n.includes("family")) return 4;
  if (n.includes("deluxe")) return 3;
  return 2;
};

const BookingSection = () => {
  const { t } = useT();
  const rooms = useRooms();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  // Key qty by stable index (room.name can collide if duplicates exist)
  const [qty, setQty] = useState<Record<number, number>>({});
  const [lastBooking, setLastBooking] = useState<BookingPdfData | null>(null);

  const unavailableStr = useUnavailableDates();
  const perRoom = usePerRoomUnavailable();

  const unavailable = useMemo(() => unavailableStr.map((d) => new Date(d)), [unavailableStr]);
  const isUnavailable = (d: Date) => unavailable.some((u) => isSameDay(u, d));
  const rangeHasGlobalUnavailable = (a?: Date, b?: Date) => {
    if (!a || !b) return false;
    return eachDayOfInterval({ start: a, end: b }).some(isUnavailable);
  };

  const roomHasConflict = (roomName: string, a?: Date, b?: Date) => {
    if (!a || !b) return false;
    const blocked = (perRoom[roomName] ?? []).map((d) => new Date(d));
    if (blocked.length === 0) return false;
    return eachDayOfInterval({ start: a, end: b }).some((d) =>
      blocked.some((u) => isSameDay(u, d))
    );
  };

  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;

  type Selected = { idx: number; room: typeof rooms[number]; count: number };
  const selectedEntries: Selected[] = rooms
    .map((room, idx) => ({ idx, room, count: qty[idx] || 0 }))
    .filter((e) => e.count > 0);

  const totalRooms = selectedEntries.reduce((s, e) => s + e.count, 0);
  const totalCapacity = selectedEntries.reduce(
    (s, e) => s + inferCapacity(e.room.name) * e.count,
    0
  );
  const subtotal = selectedEntries.reduce((s, e) => s + e.room.price * e.count, 0);
  const total = subtotal * Math.max(1, nights);

  const inc = (idx: number, roomName: string) => {
    if (checkIn && checkOut && roomHasConflict(roomName, checkIn, checkOut)) {
      toast.error(`${roomName} is sold out for the selected dates`);
      return;
    }
    setQty((p) => ({ ...p, [idx]: (p[idx] || 0) + 1 }));
  };
  const dec = (idx: number) =>
    setQty((p) => ({ ...p, [idx]: Math.max(0, (p[idx] || 0) - 1) }));

  // When check-in changes, ensure check-out stays strictly after it
  const handleCheckInChange = (d?: Date) => {
    setCheckIn(d);
    if (d && checkOut && checkOut <= d) {
      setCheckOut(undefined);
      toast.message("Please reselect check-out date (must be after check-in).");
    }
  };

  const handleCheckOutChange = (d?: Date) => {
    if (d && checkIn && d <= checkIn) {
      toast.error("Check-out date must be later than check-in date.");
      return;
    }
    setCheckOut(d);
  };

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return toast.error(t("booking.errName"));
    if (!checkIn || !checkOut) return toast.error(t("booking.errDates"));
    if (checkOut <= checkIn) return toast.error("Check-out date must be later than check-in date.");
    if (rangeHasGlobalUnavailable(checkIn, checkOut)) return toast.error(t("booking.errUnavail"));
    if (selectedEntries.length === 0) return toast.error(t("booking.errRoom"));

    const conflicting = selectedEntries.filter((e) => roomHasConflict(e.room.name, checkIn, checkOut));
    if (conflicting.length > 0) {
      return toast.error(
        `${conflicting.map((e) => e.room.name).join(", ")} sold out for these dates. Please remove or change dates.`
      );
    }

    const data: BookingPdfData = {
      name, phone, checkIn, checkOut, nights, guests,
      rooms: selectedEntries.map((e) => ({ name: e.room.name, qty: e.count, price: e.room.price })),
      total, message: message || undefined,
    };
    setLastBooking(data);

    trackEvent("booking_whatsapp_submit", { rooms: totalRooms, guests, total });
    const lines = selectedEntries
      .map((e) => `• ${e.room.name} × ${e.count} (₹${e.room.price.toLocaleString()}/night)`)
      .join("\n");
    const text = `Hi, I'd like to book at Malar Park.

Name: ${name}
Phone: ${phone}
Check-in: ${format(checkIn, "PPP")}
Check-out: ${format(checkOut, "PPP")}
Nights: ${nights}
Guests: ${guests}

Rooms:
${lines}

Estimated total: ₹${total.toLocaleString()}
${message ? `Message: ${message}` : ""}`;
    const wa = buildWhatsAppHref(text, { source: "website", medium: "booking_form", campaign: "multi_room" });
    window.open(wa, "_blank");

    // Auto-download PDF confirmation
    // try {
    //   downloadBookingPdf(data);
    //   trackEvent("booking_pdf_auto_download", { total });
    //   toast.success("Booking enquiry PDF downloaded");
    // } catch (e) {
    //   console.error("PDF generation failed", e);
    // }
  };

  const handlePdfClick = () => {
    if (!lastBooking) return;
    downloadBookingPdf(lastBooking);
    trackEvent("booking_pdf_manual_download", {});
  };

  const scrollToSubmit = () => {
    document.getElementById("booking-submit")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="booking" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("booking.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{t("booking.title")}</h2>
        </div>
        <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 md:p-8 border border-border shadow-elegant pb-28 md:pb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-foreground">{t("booking.name")}</Label>
              <Input placeholder={t("booking.name")} value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-foreground">{t("booking.phone")}</Label>
              <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-foreground">{t("booking.checkin")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !checkIn && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : t("booking.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={checkIn} onSelect={handleCheckInChange}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || isUnavailable(d)}
                    initialFocus className="p-3 pointer-events-auto" />
                  {unavailable.length > 0 && <p className="text-[11px] text-muted-foreground px-3 pb-2">{t("booking.greyed")}</p>}
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-foreground">{t("booking.checkout")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !checkOut && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : t("booking.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={handleCheckOutChange}
                    disabled={(d) => {
                      // Must be strictly after check-in (or after today if no check-in yet)
                      const minDate = checkIn ? addDays(checkIn, 1) : addDays(new Date(new Date().setHours(0, 0, 0, 0)), 1);
                      return d < minDate || isUnavailable(d);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  {checkIn && (
                    <p className="text-[11px] text-muted-foreground px-3 pb-2">
                      Must be after {format(checkIn, "PPP")}
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-foreground">{t("booking.guests")}</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label className="text-foreground">{t("booking.selectRooms")}</Label>
            <div className="mt-2 space-y-2">
              {rooms.map((r, idx) => {
                const count = qty[idx] || 0;
                const soldOut = checkIn && checkOut ? roomHasConflict(r.name, checkIn, checkOut) : false;
                const capacity = inferCapacity(r.name);
                return (
                  <div key={`${r.name}-${idx}`} className={cn("flex items-center justify-between gap-2 rounded-lg p-3 transition-colors", soldOut ? "bg-destructive/10 opacity-70" : count > 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50")}>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{r.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>₹{r.price.toLocaleString()} / {t("rooms.perNight")}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> up to {capacity} guests
                        </span>
                        {soldOut && <span className="text-destructive font-medium">· Sold out for selected dates</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => dec(idx)} aria-label={`Decrease ${r.name}`} disabled={count === 0}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{count}</span>
                      <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => inc(idx, r.name)} aria-label={`Increase ${r.name}`} disabled={soldOut}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalRooms > 0 && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <div className="space-y-1 text-xs">
                {selectedEntries.map((e) => (
                  <div key={e.idx} className="flex justify-between text-foreground">
                    <span>{e.count} × {e.room.name}</span>
                    <span className="tabular-nums">₹{(e.room.price * e.count).toLocaleString()}/night</span>
                  </div>
                ))}
                <div className="flex justify-between text-muted-foreground pt-1 border-t border-primary/20">
                  <span>{nights || 1} {t("booking.nights")} · {totalRooms} room{totalRooms > 1 ? "s" : ""} · up to {totalCapacity} guests</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-primary/20">
                <p className="font-semibold text-foreground text-sm">{t("booking.total")}</p>
                <p className="text-xl font-bold text-primary tabular-nums">₹{total.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Label className="text-foreground">{t("booking.notes")}</Label>
            <Textarea placeholder="..." value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
          </div>
          <Button id="booking-submit" onClick={handleSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
            <MessageCircle className="w-5 h-5" /> {t("booking.submit")}
          </Button>

          {lastBooking && (
            <Button onClick={handlePdfClick} variant="outline" className="w-full mt-3 gap-2" size="lg">
              <Download className="w-5 h-5" /> {t("booking.downloadPdf")}
            </Button>
          )}
        </div>
      </div>

      {/* Sticky mobile summary */}
      {totalRooms > 0 && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-elegant p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {totalRooms} room{totalRooms > 1 ? "s" : ""} · {nights || 1} {t("booking.nights")}
            </p>
            <p className="text-lg font-bold text-primary tabular-nums leading-tight">
              ₹{total.toLocaleString()}
            </p>
          </div>
          <Button onClick={scrollToSubmit} className="gap-2 shrink-0">
            <MessageCircle className="w-4 h-4" /> Continue
          </Button>
        </div>
      )}
    </section>
  );
};

export default BookingSection;
