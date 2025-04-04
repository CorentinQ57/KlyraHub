import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-9xl font-bold text-klyra">404</h1>
        <h2 className="mt-4 text-2xl font-bold">Page non trouvée</h2>
        <p className="mt-2 text-muted-foreground">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 