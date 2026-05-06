import { describe, it, expect, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import FAQSection from "@/components/FAQSection";
import { LanguageProvider, useT } from "@/i18n/LanguageContext";

const countScripts = (id: string) =>
  document.head.querySelectorAll(`script#${id}`).length;

const allFaqIds = () =>
  Array.from(
    document.head.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    )
  ).map((s) => s.id);

let toggleFn: () => void = () => {};
const Harness = () => {
  const { toggle, lang } = useT();
  toggleFn = toggle;
  return (
    <div data-lang={lang}>
      <FAQSection />
    </div>
  );
};

beforeEach(() => {
  localStorage.clear();
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((n) => n.remove());
});

describe("FAQSection JSON-LD lifecycle on language toggle", () => {
  it("emits exactly one EN tag, no TA tag in EN mode", () => {
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>
    );
    expect(countScripts("jsonld-faq-en")).toBe(1);
    expect(countScripts("jsonld-faq-ta")).toBe(0);
  });

  it("toggles to TA: exactly one EN + one TA, no duplicates", () => {
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>
    );
    act(() => toggleFn()); // → ta
    expect(countScripts("jsonld-faq-en")).toBe(1);
    expect(countScripts("jsonld-faq-ta")).toBe(1);
    // No stale duplicates of any id
    const ids = allFaqIds();
    const set = new Set(ids);
    expect(ids.length).toBe(set.size);
  });

  it("toggles back to EN: TA tag is fully removed, no stale residue", () => {
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>
    );
    act(() => toggleFn()); // → ta
    act(() => toggleFn()); // → en
    expect(countScripts("jsonld-faq-en")).toBe(1);
    expect(countScripts("jsonld-faq-ta")).toBe(0);
  });

  it("rapid 5x toggle cycle never accumulates stale or duplicate scripts", () => {
    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>
    );
    for (let i = 0; i < 5; i++) {
      act(() => toggleFn());
    }
    // After 5 toggles starting from en: en→ta→en→ta→en→ta = ta
    expect(countScripts("jsonld-faq-en")).toBe(1);
    expect(countScripts("jsonld-faq-ta")).toBe(1);
    const ids = allFaqIds();
    expect(new Set(ids).size).toBe(ids.length);
  });
});
