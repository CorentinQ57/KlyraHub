"use client"

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DocumentationNavigation } from '@/components/ui/documentation-navigation'
import Link from 'next/link'
import { 
  Menu, X, ChevronRight, 
  Home, BookOpen, ShoppingBag, 
  HelpCircle, Settings, 
  Menu as MenuIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Composant pour la barre latérale principale
function MainSidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Accueil', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Documentation', href: '/documentation', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Services', href: '/services', icon: <ShoppingBag className="h-5 w-5" /> },
    { name: 'Support', href: '/support', icon: <HelpCircle className="h-5 w-5" /> },
    { name: 'Admin', href: '/admin', icon: <Settings className="h-5 w-5" /> },
  ]
  
  return (
    <div className="hidden md:flex flex-col w-16 xl:w-64 h-full bg-white border-r border-[#E2E8F0]">
      <div className="flex items-center h-16 px-4">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#467FF7] rounded-md flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            <span className="text-xl font-bold hidden xl:block">Klyra</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = 
              item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href)
                
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-[#EBF2FF] text-[#467FF7]"
                    : "text-[#1A2333] hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex-shrink-0",
                  isActive ? "text-[#467FF7]" : "text-[#64748B]"
                )}>
                  {item.icon}
                </div>
                <span className="hidden xl:block ml-3">{item.name}</span>
                {item.name === 'Documentation' && isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 hidden xl:block" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default function DocumentationLayout({
  children,
}: {
  children: ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()
  
  // Fermer la navigation mobile lors du changement de page
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])
  
  // Fermer la navigation mobile sur resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileNavOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return (
    <div className="flex h-screen">
      {/* Barre latérale principale - fixe sur les écrans MD et plus */}
      <MainSidebar />
      
      {/* Overlay de navigation mobile */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      
      {/* Barre latérale mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full transform transition-transform duration-300 ease-in-out md:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <MainSidebar />
          </div>
        </div>
      </div>
      
      {/* Barre latérale de documentation */}
      <div className="hidden md:block w-64 lg:w-72 h-full overflow-y-auto bg-white border-r border-[#E2E8F0]">
        <DocumentationNavigation />
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden flex items-center h-16 px-4 border-b border-[#E2E8F0]">
          <button
            type="button"
            className="p-2 rounded-md text-[#1A2333]"
            onClick={() => setMobileNavOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#467FF7] rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="text-xl font-bold">Klyra</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Zone de contenu avec padding */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 