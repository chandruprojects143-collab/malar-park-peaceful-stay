import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildFaqSchema } from "@/components/FAQSection";
import { useT } from "@/i18n/LanguageContext";
import { toast } from "sonner";

const SeoPreview = () => {
  const { lang, setLang } = useT();
  const [tick, setTick] = useState(0);

  // Re-scan whenever the user toggles language (DOM updates after FAQSection effect)
  useEffect(() => {
    const id = setTimeout(() => setTick((t) => t + 1), 50);
    return () => clearTimeout(id);
  }, [lang]);

  const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
  const expectedEn = useMemo(() => buildFaqSchema("en", url), [url]);
  const expectedTa = useMemo(() => buildFaqSchema("ta", url), [url]);

  // Live scrape from <head>
  const liveScripts = useMemo(() => {
    if (typeof document === "undefined") return [];
    return Array.from(
      document.head.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]'
      )
    ).map((el) => ({ id: el.id || "(no id)", text: el.text }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, lang]);

  const faqEnTags = liveScripts.filter((s) => s.id === "jsonld-faq-en");
  const faqTaTags = liveScripts.filter((s) => s.id === "jsonld-faq-ta");

  const enOk = faqEnTags.length === 1;
  const taOk = lang === "ta" ? faqTaTags.length === 1 : faqTaTags.length === 0;

  // Detect duplicates of any other schema script by id
  const idCounts = liveScripts.reduce<Record<string, number>>((acc, s) => {
    acc[s.id] = (acc[s.id] || 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(idCounts).filter(([, n]) => n > 1);

  const refresh = () => setTick((t) => t + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-heading font-bold">🔎 SEO Preview — FAQ JSON-LD</h1>
        <div className="flex gap-2">
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
          <CardTitle className="text-sm">All JSON-LD scripts in &lt;head&gt; ({liveScripts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {liveScripts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              None detected. Visit the homepage in another tab first to mount FAQSection, then click Re-scan.
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

export default SeoPreview;
