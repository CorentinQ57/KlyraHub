"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'
import { News, type NewsArticle } from '@/components/ui/sidebar-news'
import { 
  LayoutDashboard, 
  User, 
  ShoppingCart, 
  Store, 
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  LogIn
} from 'lucide-react'

// Interface pour les liens de navigation
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

// Articles de news avec l'onboarding mis en avant
const NEWS_ARTICLES: NewsArticle[] = [
  {
    href: "/onboarding",
    title: "Complétez votre onboarding",
    summary: "Configurez votre profil et vos préférences pour une expérience personnalisée",
    image: "/images/news/onboarding.jpg",
  },
  {
    href: "/dashboard/marketplace",
    title: "Nouveaux services disponibles",
    summary: "Découvrez les derniers services ajoutés à notre marketplace",
    image: "/images/news/marketplace.jpg",
  },
  {
    href: "/dashboard/docs/getting-started",
    title: "Guide de démarrage rapide",
    summary: "Apprenez à utiliser Klyra Hub en quelques minutes",
    image: "/images/news/documentation.jpg",
  },
];

export function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, reloadAuthState } = useAuth()
  
  // Vérifier si le chemin actuel est dans la section documentation
  const isDocsRoute = pathname.startsWith('/dashboard/docs')
  
  // Charger l'état de collapse depuis localStorage au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-collapsed')
      if (savedState !== null) {
        setIsCollapsed(savedState === 'true')
      }
    }
  }, [])
  
  // Sauvegarder l'état de collapse dans localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(newState))
    }
  }
  
  // Détermine si un lien est actif
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }
  
  // Ferme le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])
  
  // Fonction pour recharger l'état d'authentification
  const handleReloadAuth = async () => {
    setIsRefreshing(true)
    try {
      await reloadAuthState()
    } catch (error) {
      console.error("Erreur lors du rechargement de l'authentification:", error)
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Liens de navigation pour tous les utilisateurs
  const userNavLinks: NavLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      href: '/dashboard/profile',
      label: 'Profil',
      icon: <User className="h-5 w-5" />
    },
    {
      href: '/dashboard/purchases',
      label: 'Mes achats',
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      href: '/dashboard/marketplace',
      label: 'Marketplace',
      icon: <Store className="h-5 w-5" />
    },
    {
      href: '/dashboard/docs',
      label: 'Documentation',
      icon: <BookOpen className="h-5 w-5" />
    }
  ]
  
  // Groupes de navigation (pour l'organisation visuelle)
  const navGroups: NavGroup[] = [
    {
      title: 'Menu principal',
      links: userNavLinks
    }
  ]
  
  // Liens d'action en bas de la sidebar
  const actionLinks: NavLink[] = [
    {
      href: '/dashboard?showTutorial=true',
      label: 'Aide',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      href: '#',
      label: 'Actualiser',
      icon: <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
    }
  ]
  
  // Liens de navigation pour les visiteurs de la documentation sans compte
  const docsVisitorLinks: NavLink[] = [
    {
      href: '/dashboard/docs',
      label: 'Documentation',
      icon: <BookOpen className="h-5 w-5" />
    }
  ]
  
  // Lien admin supplémentaire
  const adminLink: NavLink = {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: <Settings className="h-5 w-5" />
  }
  
  // Détermine les liens à afficher selon l'authentification
  const navLinks = user || !isDocsRoute ? userNavLinks : docsVisitorLinks
  
  return (
    <>
      {/* Mobile Header & Trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white border-b px-4 py-3 flex items-center justify-between">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Overlay pour le menu mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] flex flex-col bg-white border-r transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Toggle */}
        <div className={cn(
          "border-b flex items-center transition-all duration-300 ease-in-out",
          isCollapsed ? "h-16 justify-center" : "h-16 px-4"
        )}>
          <div className={cn("flex-shrink-0", isCollapsed ? "hidden" : "block")}>
            <Logo />
          </div>
          <div className={cn("flex-shrink-0", isCollapsed ? "block" : "hidden")}>
            <Logo small />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn("ml-auto", isCollapsed ? "hidden lg:flex" : "hidden lg:flex")}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="px-3">
                {!isCollapsed && (
                  <div className="mb-2 px-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </p>
                  </div>
                )}
                <nav className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center rounded-md transition-colors",
                        isCollapsed ? "justify-center p-3" : "px-4 py-2",
                        isActive(link.href) && (link.exact ? pathname === link.href : true)
                          ? "bg-primary/10 text-primary" 
                          : "text-gray-600 hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <span className="flex-shrink-0">{link.icon}</span>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">{link.label}</span>
                      )}
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link 
                      href={adminLink.href}
                      className={cn(
                        "flex items-center rounded-md transition-colors",
                        isCollapsed ? "justify-center p-3" : "px-4 py-2",
                        isActive(adminLink.href) 
                          ? "bg-primary/10 text-primary" 
                          : "text-gray-600 hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <span className="flex-shrink-0">{adminLink.icon}</span>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">{adminLink.label}</span>
                      )}
                    </Link>
                  )}
                </nav>
              </div>
            ))}

            {/* Marketplace button highlighted */}
            <div className="px-3">
              <Link 
                href="/dashboard/marketplace"
                className={cn(
                  "flex items-center rounded-md",
                  isCollapsed ? "justify-center p-3" : "px-4 py-2",
                  "bg-primary text-white hover:bg-primary/90 transition-colors"
                )}
              >
                <Store className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span className="text-sm font-medium">Explorer</span>}
              </Link>
            </div>
          </div>
        </div>
        
        {/* News Component - Ajouté au-dessus des liens d'action */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <News articles={NEWS_ARTICLES} />
          </div>
        )}
        
        {/* Action Links */}
        <div className="border-t py-4">
          <div className="px-3 space-y-1">
            {actionLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={link.label === 'Actualiser' ? (e) => {
                  e.preventDefault();
                  handleReloadAuth();
                } : undefined}
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  isCollapsed ? "justify-center p-3" : "px-4 py-2",
                  "text-gray-600 hover:text-primary hover:bg-primary/5"
                )}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{link.label}</span>
                )}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                }}
                className={cn(
                  "flex items-center rounded-md transition-colors w-full",
                  isCollapsed ? "justify-center p-3" : "px-4 py-2",
                  "text-gray-600 hover:text-red-500 hover:bg-red-50"
                )}
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">Déconnexion</span>
                )}
              </button>
            ) : isDocsRoute ? (
              <Link
                href="/login"
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  isCollapsed ? "justify-center p-3" : "px-4 py-2",
                  "text-primary hover:bg-primary/5"
                )}
              >
                <LogIn className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">Se connecter</span>
                )}
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
} 