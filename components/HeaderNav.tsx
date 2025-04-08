import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, User, ShoppingCart, Home, Package, Settings, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'
import { 
  LayoutDashboard, 
  LogOut 
} from 'lucide-react'

export function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  
  // Liste des liens de navigation pour l'utilisateur
  const userLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Home className="h-4 w-4" />
    },
    {
      href: '/dashboard/marketplace',
      label: 'Services',
      icon: <Package className="h-4 w-4" />
    },
    {
      href: '/dashboard/purchases',
      label: 'Achats',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      href: '/dashboard/profile',
      label: 'Profil',
      icon: <User className="h-4 w-4" />
    }
  ]
  
  // Ajouter le lien admin si l'utilisateur est admin
  const adminLink = {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: <Settings className="h-4 w-4" />
  }
  
  const links = isAdmin ? [...userLinks, adminLink] : userLinks
  
  // Déterminer si un lien est actif
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true
    }
    return href !== '/dashboard' && pathname?.startsWith(href)
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary">Klyra</span>
          </Link>
          
          {/* Navigation pour ordinateur */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/dashboard?showTutorial=true" className="hidden md:flex items-center text-sm text-gray-600 hover:text-primary">
            <HelpCircle className="h-4 w-4 mr-1" />
            <span>Aide</span>
          </Link>
          
          {/* Bouton hamburger pour mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Navigation mobile */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <nav className="flex flex-col space-y-2">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
              <Link
                href="/dashboard?showTutorial=true"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-primary hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="ml-2">Aide</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
} 