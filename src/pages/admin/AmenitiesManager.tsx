import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function AmenitiesManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="amenities"
        title="Amenities"
        rowTitle={r => r.title}
        rowSubtitle={r => `Icon: ${r.icon}`}
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description (optional)", type: "textarea" },
          { key: "icon", label: "Icon (lucide-react name, e.g. Wifi, Car, ShowerHead)", type: "text", placeholder: "Wifi" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
