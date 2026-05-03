import { CheckCircle } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

const keys = ["about.h.clean","about.h.walk","about.h.calm","about.h.budget","about.h.staff","about.h.giri"];

const AboutSection = () => {
  const { t } = useT();
  return (
    <section id="about" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-2">{t("about.kicker")}</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t("about.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("about.body")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {keys.map((k) => (
            <div key={k} className="flex items-center gap-3 bg-muted rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground text-sm font-medium">{t(k)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
