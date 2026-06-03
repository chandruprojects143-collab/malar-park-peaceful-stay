import { Component, ReactNode } from "react";

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif", background: "#faf8f3", color: "#0f3a2e", textAlign: "center" }}>
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Something went wrong</h1>
            <p style={{ color: "#555", marginBottom: "1.5rem" }}>
              We hit an unexpected error loading this page. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "#0f3a2e", color: "#fff", border: 0, padding: "0.75rem 1.5rem", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}
            >
              Refresh page
            </button>
            {import.meta.env.DEV && (
              <pre style={{ marginTop: "1.5rem", textAlign: "left", background: "#fff", padding: "1rem", borderRadius: 8, fontSize: 12, overflow: "auto", maxHeight: 240 }}>
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
