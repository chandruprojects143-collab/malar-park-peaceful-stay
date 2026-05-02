import { useState, useMemo } from "react";
import { CalendarIcon, Users, BedDouble, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, eachDayOfInterval } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useUnavailableDates } from "@/hooks/useRooms";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const BookingSection = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [room, setRoom] = useState("deluxe");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const unavailableStr = useUnavailableDates();
  const unavailable = useMemo(() => unavailableStr.map(d => new Date(d)), [unavailableStr]);

  const isUnavailable = (d: Date) => unavailable.some(u => isSameDay(u, d));

  const rangeHasUnavailable = (a?: Date, b?: Date) => {
    if (!a || !b) return false;
    return eachDayOfInterval({ start: a, end: b }).some(isUnavailable);
  };

  const handleWhatsAppBooking = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (rangeHasUnavailable(checkIn, checkOut)) {
      toast.error("Some dates in your range are unavailable. Please choose different dates.");
      return;
    }
    trackEvent("booking_whatsapp_submit", { room, guests });
    const text = `Hi, I'd like to book at Malar Park.\n\nName: ${name}\nPhone: ${phone}\nCheck-in: ${format(checkIn, "PPP")}\nCheck-out: ${format(checkOut, "PPP")}\nGuests: ${guests}\nRoom: ${room}\n${message ? `Message: ${message}` : ""}`;
    window.open(`https://wa.me/918300003829?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="booking" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">Reservations</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Book Your Stay
          </h2>
        </div>
        <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 md:p-8 border border-border shadow-elegant">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-foreground">Full Name</Label>
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-foreground">Phone Number</Label>
              <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-foreground">Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !checkIn && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-foreground">Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !checkOut && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(d) => d < (checkIn || new Date())} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-foreground">Guests</Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Room Type</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deluxe">Deluxe Room</SelectItem>
                  <SelectItem value="family">Family Room</SelectItem>
                  <SelectItem value="suite">Suite Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-6">
            <Label className="text-foreground">Special Requests (optional)</Label>
            <Textarea placeholder="Any special requirements..." value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleWhatsAppBooking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
            <MessageCircle className="w-5 h-5" /> Book via WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
