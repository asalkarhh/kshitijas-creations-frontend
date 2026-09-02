import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Application error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6 text-center">
        <div className="max-w-md">
          <AlertTriangle aria-hidden="true" className="mx-auto size-10 text-maroon" />
          <h1 className="mt-5 font-display text-3xl text-ink">Something went wrong</h1>
          <p className="mt-3 leading-7 text-muted">Please refresh the page and try again.</p>
          <button
            className="button-primary mt-6"
            onClick={() => window.location.reload()}
            type="button"
          >
            Refresh page
          </button>
        </div>
      </main>
    );
  }
}
