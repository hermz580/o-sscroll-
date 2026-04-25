import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0a] text-[#f5f2ed]">
          <AlertTriangle className="w-12 h-12 text-[#c5a059] mb-4" />
          <h2 className="text-2xl font-serif mb-2">The Oracle's Connection Faltered</h2>
          <p className="opacity-60 mb-6 max-w-md">An unexpected error occurred while processing your vision. The spirits may be overwhelmed.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#c5a059] text-[#0a0a0a] rounded-full font-bold uppercase tracking-widest text-xs"
          >
            Reconnect with Olari
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
