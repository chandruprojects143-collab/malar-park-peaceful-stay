import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function OtaLinksManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="ota_links"
        title="Booking Platforms (OTAs)"
        rowTitle={r => r.platform}
        rowSubtitle={r => r.url}
        rowImage={r => r.logo_url}
        fields={[
          { key: "platform", label: "Platform name", type: "text", placeholder: "Booking.com" },
          { key: "logo_url", label: "Logo URL", type: "text" },
          { key: "url", label: "Listing URL", type: "text" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
