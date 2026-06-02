import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function HeroManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="hero_slides"
        title="Hero Slides"
        rowTitle={r => r.title ?? "(untitled)"}
        rowSubtitle={r => r.subtitle ?? ""}
        rowImage={r => r.image_url}
        fields={[
          { key: "image_url", label: "Image URL (paste public URL or use Media Library)", type: "text", placeholder: "https://..." },
          { key: "title", label: "Overlay title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "cta_label", label: "Button label", type: "text", placeholder: "Book Now" },
          { key: "cta_href", label: "Button link", type: "text", placeholder: "#booking" },
          { key: "sort", label: "Sort order", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
