import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Global safety nets — log instead of letting the page silently die.
window.addEventListener("error", (e) => console.error("[window.error]", e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => console.error("[unhandledrejection]", e.reason));

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui">Root element missing.</div>';
} else {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
