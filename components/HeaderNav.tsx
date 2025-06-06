import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
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
  LogIn,
  BarChart2,
  Lock,
} from 'lucide-react';

// Interface pour les liens de navigation
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, reloadAuthState } = useAuth();
  
  // Vérifier si le chemin actuel est dans la section documentation
  const isDocsRoute = pathname.startsWith('/dashboard/docs');
  
  // Détermine si un lien est actif
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  // Fonction pour recharger l'état d'authentification
  const handleReloadAuth = async () => {
    setIsRefreshing(true);
    try {
      await reloadAuthState();
    } catch (error) {
      console.error('Erreur lors du rechargement de l\'authentification:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Liens de navigation pour tous les utilisateurs
  const userNavLinks: NavLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-1" />,
      exact: true,
    },
    {
      href: '/dashboard/profile',
      label: 'Profil',
      icon: <User className="h-4 w-4 mr-1" />,
    },
    {
      href: '/dashboard/purchases',
      label: 'Mes achats',
      icon: <ShoppingCart className="h-4 w-4 mr-1" />,
    },
    {
      href: '/dashboard/marketplace',
      label: 'Marketplace',
      icon: <Store className="h-4 w-4 mr-1" />,
    },
    {
      href: '/dashboard/projects/timeline',
      label: 'Timeline',
      icon: <div className="relative"><BarChart2 className="h-4 w-4 mr-1" /><Lock className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" /></div>,
    },
    {
      href: '/dashboard/docs',
      label: 'Documentation',
      icon: <div className="relative"><BookOpen className="h-4 w-4 mr-1" /><Lock className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" /></div>,
    },
  ];
  
  // Liens de navigation pour les visiteurs de la documentation sans compte
  const docsVisitorLinks: NavLink[] = [
    {
      href: '/dashboard/docs',
      label: 'Documentation',
      icon: <BookOpen className="h-4 w-4 mr-1" />,
    },
  ];
  
  // Lien admin supplémentaire
  const adminLink: NavLink = {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: <Settings className="h-4 w-4 mr-1" />,
  };
  
  // Détermine les liens à afficher selon l'authentification
  const navLinks = user || !isDocsRoute ? userNavLinks : docsVisitorLinks;
  
  return (
    <header className="sticky top-0 z-[60] border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href) && (link.exact ? pathname === link.href : true)
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link 
                href={adminLink.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(adminLink.href) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {adminLink.icon}
                {adminLink.label}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard?showTutorial=true" className="hidden lg:flex items-center text-sm text-gray-600 hover:text-primary mr-2">
                <HelpCircle className="h-4 w-4 mr-1" />
                Aide
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReloadAuth}
                disabled={isRefreshing}
                className="flex items-center mr-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Déconnexion
              </Button>
            </>
          ) : isDocsRoute ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/login')}
              className="flex items-center"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Se connecter
            </Button>
          ) : null}
        </div>
      </div>
      
      {/* Navigation mobile (pour les petits écrans) */}
      <div className="lg:hidden border-t py-2">
        <div className="container flex justify-between items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center text-xs font-medium p-1 ${
                isActive(link.href) && (link.exact ? pathname === link.href : true)
                  ? 'text-primary' 
                  : 'text-gray-600'
              }`}
            >
              {link.icon}
              <span className="mt-1">{link.label}</span>
            </Link>
          ))}
          
          {isAdmin && (
            <Link
              href={adminLink.href}
              className={`flex flex-col items-center text-xs font-medium p-1 ${
                isActive(adminLink.href) 
                  ? 'text-primary' 
                  : 'text-gray-600'
              }`}
            >
              {adminLink.icon}
              <span className="mt-1">{adminLink.label}</span>
            </Link>
          )}
          
          {user ? (
            <>
              <Link
                href="/dashboard?showTutorial=true"
                className="flex flex-col items-center text-xs font-medium p-1 text-gray-600"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="mt-1">Aide</span>
              </Link>
              
              <button
                onClick={handleReloadAuth}
                disabled={isRefreshing}
                className="flex flex-col items-center text-xs font-medium p-1 text-gray-600"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="mt-1">Actualiser</span>
              </button>
            </>
          ) : isDocsRoute ? (
            <Link
              href="/login"
              className="flex flex-col items-center text-xs font-medium p-1 text-primary"
            >
              <LogIn className="h-4 w-4" />
              <span className="mt-1">Connexion</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
} 