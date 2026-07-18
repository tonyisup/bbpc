"use client";

import { Component, type ReactNode } from "react";

interface CurrentRoundErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface CurrentRoundErrorBoundaryState {
  hasError: boolean;
}

export class CurrentRoundErrorBoundary extends Component<
  CurrentRoundErrorBoundaryProps,
  CurrentRoundErrorBoundaryState
> {
  state: CurrentRoundErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CurrentRoundErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
