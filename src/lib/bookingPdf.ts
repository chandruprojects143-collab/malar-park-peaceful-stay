import jsPDF from "jspdf";
import { format } from "date-fns";

export interface BookingPdfData {
  name: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: string;
  rooms: { name: string; qty: number; price: number }[];
  total: number;
  message?: string;
}

export const generateBookingPdf = (d: BookingPdfData): jsPDF => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 50;

  // Header
  doc.setFillColor(34, 88, 65);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Malar Park Hotel", M, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Booking Enquiry Confirmation", M, 60);

  y = 110;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Reference: MP-${Date.now().toString().slice(-8)}`, M, y);
  doc.text(`Issued: ${format(new Date(), "PPpp")}`, W - M, y, { align: "right" });

  // Guest details
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Guest Details", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Name: ${d.name}`, M, y); y += 16;
  doc.text(`Phone: ${d.phone}`, M, y); y += 16;
  doc.text(`Guests: ${d.guests}`, M, y); y += 16;

  // Stay details
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Stay Details", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Check-in:  ${format(d.checkIn, "PPP")}`, M, y); y += 16;
  doc.text(`Check-out: ${format(d.checkOut, "PPP")}`, M, y); y += 16;
  doc.text(`Nights:    ${d.nights}`, M, y); y += 16;

  // Rooms table
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Rooms Selected", M, y);
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(M, y, W - M, y);
  y += 16;

  doc.setFontSize(10);
  doc.text("Room", M, y);
  doc.text("Qty", W - M - 180, y);
  doc.text("Rate (₹/night)", W - M - 130, y);
  doc.text("Subtotal (₹)", W - M, y, { align: "right" });
  y += 6;
  doc.line(M, y, W - M, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  d.rooms.forEach((r) => {
    const sub = r.qty * r.price * Math.max(1, d.nights);
    doc.text(r.name, M, y);
    doc.text(String(r.qty), W - M - 180, y);
    doc.text(r.price.toLocaleString("en-IN"), W - M - 130, y);
    doc.text(sub.toLocaleString("en-IN"), W - M, y, { align: "right" });
    y += 16;
  });

  y += 6;
  doc.line(M, y, W - M, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Estimated Total", M, y);
  doc.text(`Rs. ${d.total.toLocaleString("en-IN")}`, W - M, y, { align: "right" });

  if (d.message) {
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Message", M, y);
    doc.setFont("helvetica", "normal");
    y += 14;
    const lines = doc.splitTextToSize(d.message, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 14;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(220, 220, 220);
  doc.line(M, footerY, W - M, footerY);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This is a booking enquiry, not a confirmed reservation. Our team will confirm via WhatsApp/phone shortly.",
    M,
    footerY + 16,
    { maxWidth: W - M * 2 }
  );
  doc.text(
    "Malar Park Hotel · 1852/6 Chengam Main Road, Opp Sri Ramanasramam, Tiruvannamalai 606601 · +91 83000 03829",
    M,
    footerY + 36,
    { maxWidth: W - M * 2 }
  );

  return doc;
};

export const downloadBookingPdf = (d: BookingPdfData) => {
  const doc = generateBookingPdf(d);
  const filename = `MalarPark-Booking-${d.name.replace(/\s+/g, "_")}-${format(d.checkIn, "yyyyMMdd")}.pdf`;
  doc.save(filename);
  return filename;
};
