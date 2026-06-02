import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function NavManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="nav_items"
        title="Navigation Menu"
        rowTitle={r => r.label}
        rowSubtitle={r => r.href}
        fields={[
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Href (e.g. #rooms, /attractions)", type: "text" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
