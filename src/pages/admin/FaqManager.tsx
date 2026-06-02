import GenericCmsManager from "@/components/admin/GenericCmsManager";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";

export default function FaqManager() {
  return (
    <AdminPasswordGate>
      <GenericCmsManager
        table="faqs"
        title="FAQs"
        rowTitle={r => r.question}
        rowSubtitle={r => (r.answer_html || "").slice(0, 100)}
        fields={[
          { key: "question", label: "Question", type: "text" },
          { key: "answer_html", label: "Answer (HTML or plain text)", type: "textarea" },
          { key: "sort", label: "Sort", type: "number" },
          { key: "enabled", label: "Enabled", type: "boolean" },
        ]}
      />
    </AdminPasswordGate>
  );
}
