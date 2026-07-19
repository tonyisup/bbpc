"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface CurrentRoundErrorBoundaryProps {
  children: ReactNode;
}

interface CurrentRoundErrorBoundaryInnerProps {
  children: ReactNode;
  resetQueryError: () => void;
}

interface CurrentRoundErrorBoundaryState {
  hasError: boolean;
}

class CurrentRoundErrorBoundaryInner extends Component<
  CurrentRoundErrorBoundaryInnerProps,
  CurrentRoundErrorBoundaryState
> {
  state: CurrentRoundErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CurrentRoundErrorBoundaryState {
    return { hasError: true };
  }

  reset = () => {
    this.props.resetQueryError();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bbpc-panel space-y-3 p-5 text-zinc-300" role="alert">
          <p>The current round could not be loaded.</p>
          <Button type="button" variant="outline" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function CurrentRoundErrorBoundary({
  children,
}: CurrentRoundErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <CurrentRoundErrorBoundaryInner resetQueryError={reset}>
          {children}
        </CurrentRoundErrorBoundaryInner>
      )}
    </QueryErrorResetBoundary>
  );
}
