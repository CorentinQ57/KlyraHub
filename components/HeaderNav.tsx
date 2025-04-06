import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export function HeaderNav() {
  const router = useRouter()
  const { isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          <nav className="hidden gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-medium text-klyra transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className="text-sm font-medium transition-colors hover:text-klyra">
              Profil
            </Link>
            <Link href="/dashboard/purchases" className="text-sm font-medium transition-colors hover:text-klyra">
              Historique d'achats
            </Link>
            <Link href="/dashboard/marketplace" className="text-sm font-medium transition-colors hover:text-klyra">
              Marketplace
            </Link>
            {isAdmin && (
              <Link href="/dashboard/admin" className="text-sm font-medium transition-colors hover:text-klyra">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
} 