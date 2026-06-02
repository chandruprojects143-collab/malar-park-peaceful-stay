import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function ReviewsManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="reviews"
        title="Guest Reviews"
        rowTitle={r => r.guest_name}
        rowSubtitle={r => `${r.rating}★ – ${r.text.slice(0, 80)}`}
        fields={[
          { key: "guest_name", label: "Guest name", type: "text" },
          { key: "country", label: "Country / city", type: "text" },
          { key: "rating", label: "Rating (1-5)", type: "number" },
          { key: "text", label: "Review", type: "textarea" },
          { key: "featured", label: "Featured", type: "boolean" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
