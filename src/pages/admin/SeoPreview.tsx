import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildFaqSchema } from "@/components/FAQSection";
import { useT } from "@/i18n/LanguageContext";
import { useRooms } from "@/hooks/useRooms";
import { auditRoomImages, classifyImageUrl } from "@/lib/imageValidation";
import { buildRoomSeoExpectations, type RoomSeoExpectation } from "@/lib/roomSeoExpectations";
import { diffLines, diffSummary, type DiffLine } from "@/lib/seoDiff";
import { downloadSeoReportPdf } from "@/lib/seoPdf";
import { toast } from "sonner";
import { Download, PlayCircle, FileText } from "lucide-react";

const downloadFile = (filename: string, content: string, mime = "application/json") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

interface RoomMetaCheck {
  room: string;
  url: string;
  expected: RoomSeoExpectation["expected"];
  warnings: string[];
  imageIssues: { url: string; kind: string; message: string }[];
}

interface DiagReport {
  ranAt: string;
  rooms: { name: string; imageCount: number; badImages: number }[];
  totalImages: number;
  totalBadImages: number;
  imageIssues: { room: string; index: number; url: string; kind: string; message: string }[];
  faqEnTags: number;
  faqTaTags: number;
  duplicateScriptIds: { id: string; count: number }[];
  ogImage?: string;
  ogExtras: number;
  twitterImage?: string;
  ogImageIssue?: string;
  perRoom: RoomMetaCheck[];
}

const SeoPreview = () => {
  const { lang, setLang } = useT();
  const [tick, setTick] = useState(0);
  const rooms = useRooms();
  const [report, setReport] = useState<DiagReport | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTick((t) => t + 1), 50);
    return () => clearTimeout(id);
  }, [lang]);

  const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
  const expectedEn = useMemo(() => buildFaqSchema("en", url), [url]);
  const expectedTa = useMemo(() => buildFaqSchema("ta", url), [url]);

  const liveScripts = useMemo(() => {
    if (typeof document === "undefined") return [];
    return Array.from(
      document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    ).map((el) => ({ id: el.id || "(no id)", text: el.text }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, lang]);

  const faqEnTags = liveScripts.filter((s) => s.id === "jsonld-faq-en");
  const faqTaTags = liveScripts.filter((s) => s.id === "jsonld-faq-ta");
  const enOk = faqEnTags.length === 1;
  const taOk = lang === "ta" ? faqTaTags.length === 1 : faqTaTags.length === 0;

  const idCounts = liveScripts.reduce<Record<string, number>>((acc, s) => {
    acc[s.id] = (acc[s.id] || 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(idCounts).filter(([, n]) => n > 1);

  const refresh = () => setTick((t) => t + 1);

  const exportExpectedEn = () =>
    downloadFile("faq-expected-en.json", JSON.stringify(expectedEn, null, 2));
  const exportExpectedTa = () =>
    downloadFile("faq-expected-ta.json", JSON.stringify(expectedTa, null, 2));
  const exportLiveEn = () => {
    if (!faqEnTags[0]) return toast.error("No live English FAQ JSON-LD in DOM");
    downloadFile("faq-live-en.json", JSON.stringify(JSON.parse(faqEnTags[0].text), null, 2));
  };
  const exportLiveTa = () => {
    if (!faqTaTags[0])
      return toast.error("No live Tamil FAQ JSON-LD in DOM (toggle to தமிழ் first)");
    downloadFile("faq-live-ta.json", JSON.stringify(JSON.parse(faqTaTags[0].text), null, 2));
  };
  const exportAll = () => {
    const bundle = {
      expectedEn,
      expectedTa,
      liveEn: faqEnTags[0] ? JSON.parse(faqEnTags[0].text) : null,
      liveTa: faqTaTags[0] ? JSON.parse(faqTaTags[0].text) : null,
      activeLang: lang,
      generatedAt: new Date().toISOString(),
    };
    downloadFile("faq-jsonld-bundle.json", JSON.stringify(bundle, null, 2));
    toast.success("Downloaded JSON-LD bundle");
  };

  const runDiagnostics = async () => {
    setRunning(true);
    try {
      const audit = auditRoomImages(rooms.map((r) => ({ name: r.name, images: r.images })));
      const ogEl = document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      const twEl = document.head.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
      const extras = document.head.querySelectorAll('meta[data-dyn-og-extra="1"]').length;
      const ogIssue = ogEl?.content ? classifyImageUrl(ogEl.content)?.message : "missing og:image";

      const r: DiagReport = {
        ranAt: new Date().toISOString(),
        rooms: rooms.map((rm) => {
          const a = auditRoomImages([{ name: rm.name, images: rm.images }]);
          return { name: rm.name, imageCount: rm.images.length, badImages: a.badImages };
        }),
        totalImages: audit.totalImages,
        totalBadImages: audit.badImages,
        imageIssues: audit.issues.map((i) => ({
          room: i.room,
          index: i.index,
          url: i.issue.url,
          kind: i.issue.kind,
          message: i.issue.message,
        })),
        faqEnTags: faqEnTags.length,
        faqTaTags: faqTaTags.length,
        duplicateScriptIds: duplicates.map(([id, count]) => ({ id, count })),
        ogImage: ogEl?.content,
        ogExtras: extras,
        twitterImage: twEl?.content,
        ogImageIssue: ogIssue || undefined,
        perRoom: buildRoomSeoExpectations(rooms, window.location.origin).map((e) => ({
          room: e.room,
          url: e.url,
          expected: e.expected,
          warnings: e.metaWarnings,
          imageIssues: e.imageIssues,
        })),
      };
      setReport(r);
      const totalRoomWarnings = r.perRoom.reduce(
        (n, p) => n + p.warnings.length + p.imageIssues.length,
        0
      );
      toast.success(
        `Diagnostics complete — ${r.totalBadImages} image issue(s), ${r.duplicateScriptIds.length} duplicate(s), ${totalRoomWarnings} room meta warning(s)`
      );
    } finally {
      setRunning(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    downloadFile("seo-diagnostics-report.json", JSON.stringify(report, null, 2));
  };

  const exportPdf = () => {
    downloadSeoReportPdf({
      generatedAt: new Date(),
      activeLang: lang,
      expectedEn,
      liveEn: faqEnTags[0] ? JSON.parse(faqEnTags[0].text) : undefined,
      expectedTa,
      liveTa: faqTaTags[0] ? JSON.parse(faqTaTags[0].text) : undefined,
      diagnostics: report ?? undefined,
    });
    toast.success("Downloaded SEO PDF report");
  };

  // Live vs Expected diff
  const enExpectedStr = JSON.stringify(expectedEn, null, 2);
  const taExpectedStr = JSON.stringify(expectedTa, null, 2);
  const enLiveStr = faqEnTags[0] ? JSON.stringify(JSON.parse(faqEnTags[0].text), null, 2) : "";
  const taLiveStr = faqTaTags[0] ? JSON.stringify(JSON.parse(faqTaTags[0].text), null, 2) : "";
  const enDiff = useMemo(
    () => (enLiveStr ? diffLines(enExpectedStr, enLiveStr) : []),
    [enExpectedStr, enLiveStr]
  );
  const taDiff = useMemo(
    () => (taLiveStr ? diffLines(taExpectedStr, taLiveStr) : []),
    [taExpectedStr, taLiveStr]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-heading font-bold">🔎 SEO Preview — FAQ JSON-LD</h1>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={refresh}>Re-scan</Button>
          <Button
            size="sm"
            variant={lang === "en" ? "default" : "outline"}
            onClick={() => setLang("en")}
          >
            EN
          </Button>
          <Button
            size="sm"
            variant={lang === "ta" ? "default" : "outline"}
            onClick={() => setLang("ta")}
          >
            தமிழ்
          </Button>
        </div>
      </div>

      {/* Export bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export JSON-LD</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportExpectedEn}>
            <Download className="w-4 h-4 mr-1" /> Expected EN
          </Button>
          <Button size="sm" variant="outline" onClick={exportExpectedTa}>
            <Download className="w-4 h-4 mr-1" /> Expected TA
          </Button>
          <Button size="sm" variant="outline" onClick={exportLiveEn}>
            <Download className="w-4 h-4 mr-1" /> Live EN
          </Button>
          <Button size="sm" variant="outline" onClick={exportLiveTa}>
            <Download className="w-4 h-4 mr-1" /> Live TA
          </Button>
          <Button size="sm" variant="outline" onClick={exportAll}>
            <Download className="w-4 h-4 mr-1" /> Bundle (all)
          </Button>
          <Button size="sm" onClick={exportPdf}>
            <FileText className="w-4 h-4 mr-1" /> Download full PDF
          </Button>
        </CardContent>
      </Card>

      {/* Live vs Expected diff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live vs Expected diff (FAQPage)</CardTitle>
        </CardHeader>
        <CardContent className="grid lg:grid-cols-2 gap-4">
          <DiffPane title="English" diff={enDiff} live={enLiveStr} />
          <DiffPane
            title={`Tamil ${lang === "ta" ? "(active)" : "(only emitted in TA mode)"}`}
            diff={taDiff}
            live={taLiveStr}
            mutedIfMissing={lang !== "ta"}
          />
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Run SEO diagnostics</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={runDiagnostics} disabled={running}>
              <PlayCircle className="w-4 h-4 mr-1" /> {running ? "Running…" : "Run now"}
            </Button>
            {report && (
              <Button size="sm" variant="outline" onClick={exportReport}>
                <Download className="w-4 h-4 mr-1" /> Report
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {!report ? (
            <p className="text-xs text-muted-foreground">
              Scans all rooms for FAQPage JSON-LD presence, duplicate {`<script>`} tags by id, and
              validates OG/Twitter image URLs across the site.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="Rooms scanned" value={report.rooms.length} />
                <Stat label="Total images" value={report.totalImages} />
                <Stat
                  label="Bad image URLs"
                  value={report.totalBadImages}
                  bad={report.totalBadImages > 0}
                />
                <Stat
                  label="Duplicate script IDs"
                  value={report.duplicateScriptIds.length}
                  bad={report.duplicateScriptIds.length > 0}
                />
              </div>

              <div className="border-t pt-3">
                <p className="font-medium mb-1">FAQPage JSON-LD</p>
                <p className="text-xs text-muted-foreground">
                  English tags: {report.faqEnTags} • Tamil tags: {report.faqTaTags} • Active lang:{" "}
                  {lang.toUpperCase()}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="font-medium mb-1">OG / Twitter image</p>
                <p className="text-xs font-mono break-all">og:image → {report.ogImage || "—"}</p>
                <p className="text-xs font-mono break-all">
                  twitter:image → {report.twitterImage || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Extra og:image tags: {report.ogExtras}
                  {report.ogImageIssue ? ` • ⚠ ${report.ogImageIssue}` : " • ✅ valid"}
                </p>
              </div>

              {report.imageIssues.length > 0 && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-1 text-destructive">Image issues</p>
                  <ul className="text-xs space-y-1 max-h-48 overflow-auto">
                    {report.imageIssues.map((i, idx) => (
                      <li key={idx} className="font-mono">
                        • [{i.room} #{i.index}] {i.kind}: {i.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.duplicateScriptIds.length > 0 && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-1 text-destructive">Duplicate script IDs</p>
                  <ul className="text-xs space-y-1">
                    {report.duplicateScriptIds.map((d) => (
                      <li key={d.id} className="font-mono">
                        • {d.id} ×{d.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.perRoom.length > 0 && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Per-room meta validation</p>
                  <div className="space-y-2">
                    {report.perRoom.map((p) => {
                      const ok = p.warnings.length === 0 && p.imageIssues.length === 0;
                      return (
                        <div key={p.room} className="border rounded-md p-2 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{p.room}</span>
                            <Badge variant={ok ? "default" : "destructive"}>
                              {ok ? "PASS" : `${p.warnings.length + p.imageIssues.length} issue(s)`}
                            </Badge>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground break-all">
                            {p.url}
                          </p>
                          <p className="text-[11px]">title: {p.expected.title}</p>
                          <p className="text-[11px]">description: {p.expected.description}</p>
                          <p className="text-[11px] font-mono break-all">
                            og:image: {p.expected.ogImage || "—"}
                          </p>
                          {(p.warnings.length > 0 || p.imageIssues.length > 0) && (
                            <ul className="mt-1 text-[11px] text-destructive">
                              {p.warnings.map((w, i) => <li key={`w${i}`}>⚠ {w}</li>)}
                              {p.imageIssues.map((ii, i) => (
                                <li key={`i${i}`}>⚠ image ({ii.kind}): {ii.message}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                Ran at {new Date(report.ranAt).toLocaleString()}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Validation Summary</span>
            <Badge variant="outline">Active language: {lang.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row
            label="English FAQPage script (always required)"
            ok={enOk}
            detail={`Found ${faqEnTags.length} tag(s) with id "jsonld-faq-en"`}
          />
          <Row
            label={
              lang === "ta"
                ? "Tamil FAQPage script (required when ta active)"
                : "Tamil FAQPage script (must be absent when en active)"
            }
            ok={taOk}
            detail={`Found ${faqTaTags.length} tag(s) with id "jsonld-faq-ta"`}
          />
          <Row
            label="No duplicate JSON-LD scripts"
            ok={duplicates.length === 0}
            detail={
              duplicates.length === 0
                ? "All script IDs unique."
                : `Duplicates: ${duplicates.map(([id, n]) => `${id} ×${n}`).join(", ")}`
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            All JSON-LD scripts in &lt;head&gt; ({liveScripts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveScripts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              None detected. Visit the homepage in another tab first to mount FAQSection, then
              click Re-scan.
            </p>
          ) : (
            <ul className="text-xs space-y-1">
              {liveScripts.map((s, i) => (
                <li key={i} className="font-mono">
                  • <span className="text-primary">{s.id}</span>{" "}
                  <span className="text-muted-foreground">({s.text.length} bytes)</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <SchemaCard
          title="Expected — English (always emitted)"
          json={expectedEn}
          live={faqEnTags[0]?.text}
        />
        <SchemaCard
          title={`Expected — Tamil (${lang === "ta" ? "currently emitted" : "not emitted in EN mode"})`}
          json={expectedTa}
          live={faqTaTags[0]?.text}
          mutedIfMissing={lang !== "ta"}
        />
      </div>
    </div>
  );
};

const Stat = ({ label, value, bad }: { label: string; value: number; bad?: boolean }) => (
  <div className={`p-3 rounded-md border ${bad ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"}`}>
    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className={`text-xl font-bold ${bad ? "text-destructive" : "text-foreground"}`}>{value}</p>
  </div>
);

const Row = ({ label, ok, detail }: { label: string; ok: boolean; detail: string }) => (
  <div className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0">
    <div>
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
    <Badge variant={ok ? "default" : "destructive"}>{ok ? "PASS" : "FAIL"}</Badge>
  </div>
);

const SchemaCard = ({
  title,
  json,
  live,
  mutedIfMissing,
}: {
  title: string;
  json: object;
  live?: string;
  mutedIfMissing?: boolean;
}) => {
  const expectedStr = JSON.stringify(json, null, 2);
  const liveStr = live ? JSON.stringify(JSON.parse(live), null, 2) : "";
  const matches = live ? liveStr === expectedStr : false;

  const copy = () => {
    navigator.clipboard?.writeText(expectedStr);
    toast.success("Copied JSON-LD");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {live && (
            <Badge variant={matches ? "default" : "destructive"}>
              {matches ? "live matches" : "mismatch"}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={copy}>Copy</Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre
          className={`text-[11px] leading-snug overflow-auto max-h-96 bg-muted/40 p-3 rounded-md ${
            mutedIfMissing && !live ? "opacity-50" : ""
          }`}
        >
          {expectedStr}
        </pre>
        {!live && mutedIfMissing && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Not present in DOM (correct — Tamil schema only injects when language toggle = தமிழ்).
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const DiffPane = ({
  title,
  diff,
  live,
  mutedIfMissing,
}: {
  title: string;
  diff: DiffLine[];
  live: string;
  mutedIfMissing?: boolean;
}) => {
  const sum = diffSummary(diff);
  return (
    <div className={mutedIfMissing && !live ? "opacity-60" : ""}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-sm">{title}</p>
        {live ? (
          <Badge variant={sum.added + sum.removed === 0 ? "default" : "destructive"}>
            +{sum.added} / −{sum.removed}
          </Badge>
        ) : (
          <Badge variant="outline">no live tag</Badge>
        )}
      </div>
      {!live ? (
        <p className="text-[11px] text-muted-foreground">
          Live JSON-LD not in DOM. {mutedIfMissing ? "Toggle to தமிழ் to emit it." : ""}
        </p>
      ) : (
        <pre className="text-[10px] leading-snug overflow-auto max-h-96 bg-muted/40 p-2 rounded-md font-mono">
          {diff.map((l, i) => (
            <div
              key={i}
              className={
                l.kind === "add"
                  ? "bg-green-500/15 text-green-900 dark:text-green-300"
                  : l.kind === "del"
                  ? "bg-red-500/15 text-red-900 dark:text-red-300"
                  : ""
              }
            >
              {l.kind === "add" ? "+ " : l.kind === "del" ? "- " : "  "}
              {l.text}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
};

export default SeoPreview;
