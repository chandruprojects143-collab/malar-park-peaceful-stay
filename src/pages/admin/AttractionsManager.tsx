import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function AttractionsManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="attractions"
        title="Nearby Attractions"
        rowTitle={r => r.name}
        rowSubtitle={r => r.distance ?? ""}
        rowImage={r => r.image_url}
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "distance", label: "Distance (e.g. 500 m, 2 km)", type: "text" },
          { key: "image_url", label: "Image URL", type: "text" },
          { key: "maps_url", label: "Google Maps URL", type: "text" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
