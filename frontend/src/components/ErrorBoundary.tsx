import React from 'react';
import styled from 'styled-components';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const Fallback = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  background: #fff5f5;
  color: #721c24;
  text-align: center;

  h2 {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
  }

  p {
    font-size: 0.95rem;
    color: #856404;
  }
`;

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Fallback>
            <h2>Something went wrong</h2>
            <p>Try refreshing the page. If the problem persists, contact support.</p>
          </Fallback>
        )
      );
    }
    return this.props.children;
  }
}
