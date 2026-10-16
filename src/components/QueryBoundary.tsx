import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode } from "react";
import Card from "./cards/Card";

type BoundaryProps = {
  title?: string;
  onReset: () => void;
  children: ReactNode;
};

type BoundaryState = { error: Error | null };

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[WeatherOps]", error, info.componentStack);
  }

  retry = () => {
    this.props.onReset(); // clears the failed react-query state
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Card title={this.props.title} childrenClassName="flex flex-col gap-4">
        <p className="text-red-400 font-medium">Couldn't load this data.</p>
        <p className="text-sm text-gray-400 break-words">
          {this.state.error.message}
        </p>
        <button
          onClick={this.retry}
          className="self-start px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          Try again
        </button>
      </Card>
    );
  }
}

/**
 * Wrap anything that uses useSuspenseQuery. Without this, one failed request
 * unmounts the whole React tree and the page turns blank.
 */
export default function QueryBoundary({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary title={title} onReset={reset}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
