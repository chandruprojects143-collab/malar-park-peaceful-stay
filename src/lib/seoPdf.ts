import jsPDF from "jspdf";
import { format } from "date-fns";

export interface SeoPdfPayload {
  generatedAt: Date;
  activeLang: "en" | "ta";
  expectedEn: object;
  liveEn?: object;
  expectedTa: object;
  liveTa?: object;
  diagnostics?: any;
}

const HEADER_BG: [number, number, number] = [34, 88, 65];

export const downloadSeoReportPdf = (p: SeoPdfPayload): string => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;
  let y = 50;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > H - 40) {
      doc.addPage();
      y = 50;
    }
  };

  // Header
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Malar Park — SEO JSON-LD Report", M, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generated ${format(p.generatedAt, "PPpp")}  •  Active lang: ${p.activeLang.toUpperCase()}`,
    M,
    52
  );
  y = 90;

  doc.setTextColor(20, 20, 20);

  const heading = (text: string) => {
    newPageIfNeeded(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(text, M, y);
    y += 16;
    doc.setDrawColor(180);
    doc.line(M, y, W - M, y);
    y += 10;
  };

  const codeBlock = (label: string, content: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    newPageIfNeeded(20);
    doc.text(label, M, y);
    y += 12;
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(content, W - M * 2);
    for (const ln of lines) {
      newPageIfNeeded(11);
      doc.text(ln, M, y);
      y += 10;
    }
    y += 6;
  };

  const json = (o: any) => JSON.stringify(o, null, 2);

  heading("English FAQPage JSON-LD");
  codeBlock("Expected", json(p.expectedEn));
  codeBlock("Live", p.liveEn ? json(p.liveEn) : "(not present in DOM)");

  heading("Tamil FAQPage JSON-LD");
  codeBlock("Expected", json(p.expectedTa));
  codeBlock(
    "Live",
    p.liveTa
      ? json(p.liveTa)
      : `(not present — correct when active lang is EN; current: ${p.activeLang.toUpperCase()})`
  );

  if (p.diagnostics) {
    heading("Diagnostics Report");
    codeBlock("Summary", json(p.diagnostics));
  }

  // Footer page numbers
  const total = (doc as any).getNumberOfPages?.() ?? 1;
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Page ${i} of ${total}`, W - M, H - 20, { align: "right" });
  }

  const filename = `seo-report-${format(p.generatedAt, "yyyyMMdd-HHmm")}.pdf`;
  doc.save(filename);
  return filename;
};
