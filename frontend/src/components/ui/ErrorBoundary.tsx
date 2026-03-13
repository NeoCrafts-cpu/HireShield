import { Component, type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { NeonButton } from "./NeonButton";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <GlassCard className="p-8 text-center" glow="none">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-white mb-2">
            {this.props.fallbackMessage || "Something went wrong"}
          </h3>
          <p className="text-[rgba(255,255,255,0.4)] text-sm mb-4 font-mono break-all">
            {this.state.error?.message}
          </p>
          <NeonButton
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </NeonButton>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}
