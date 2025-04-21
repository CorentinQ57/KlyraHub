'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
            <p className="text-gray-600 mb-6">
              Une erreur inattendue s'est produite. Veuillez réessayer.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Recharger l'application
              </Button>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                >
                  Réinitialiser et se reconnecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 