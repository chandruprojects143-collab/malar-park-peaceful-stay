import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageContext";

const LanguageToggle = ({ className = "" }: { className?: string }) => {
  const { toggle, t, lang } = useT();
  return (
    <Button
      type="button"
      onClick={toggle}
      size="sm"
      variant="outline"
      className={`gap-1.5 ${className}`}
      aria-label={`Switch to ${lang === "en" ? "Tamil" : "English"}`}
    >
      <Languages className="w-4 h-4" /> {t("lang.toggle")}
    </Button>
  );
};

export default LanguageToggle;
