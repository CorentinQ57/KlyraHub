'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-gray-600 mb-8">
          Nous sommes désolés, une erreur inattendue s'est produite.
        </p>
        <div className="space-x-4">
          <Button onClick={reset} variant="outline">
            Réessayer
          </Button>
          <Link href="/dashboard">
            <Button>
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 