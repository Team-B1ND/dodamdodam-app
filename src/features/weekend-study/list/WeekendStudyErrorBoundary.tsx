import React, { Component, type ReactNode } from "react";

interface WeekendStudyErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
}

interface WeekendStudyErrorBoundaryState {
  hasError: boolean;
}

/** 목록 조회 실패 시 중복 토스트 없이 인라인 오류 상태(다시 시도)만 보여준다. */
export class WeekendStudyErrorBoundary extends Component<
  WeekendStudyErrorBoundaryProps,
  WeekendStudyErrorBoundaryState
> {
  state: WeekendStudyErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WeekendStudyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
