'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Erreur critique</h1>
            <p className="text-gray-600 mb-8">
              Une erreur critique est survenue. Veuillez réessayer.
            </p>
            <Button onClick={() => reset()}>
              Réessayer
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
} 