"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

// Structure de la navigation (à adapter selon votre documentation)
const DOCUMENTATION_NAV = [
  {
    title: 'Introduction',
    slug: '/documentation',
    items: [],
  },
  {
    title: 'Commencer',
    slug: '/documentation/getting-started',
    items: [
      { title: 'Installation', slug: '/documentation/getting-started/installation' },
      { title: 'Configuration', slug: '/documentation/getting-started/configuration' },
      { title: 'Premiers pas', slug: '/documentation/getting-started/first-steps' },
    ],
  },
  {
    title: 'Composants',
    slug: '/documentation/components',
    items: [
      { title: 'Boutons', slug: '/documentation/components/buttons' },
      { title: 'Cartes', slug: '/documentation/components/cards' },
      { title: 'Formulaires', slug: '/documentation/components/forms' },
      { title: 'Tableaux', slug: '/documentation/components/tables' },
      { title: 'Modales', slug: '/documentation/components/modals' },
    ],
  },
  {
    title: 'Guides',
    slug: '/documentation/guides',
    items: [
      { title: 'Authentification', slug: '/documentation/guides/authentication' },
      { title: 'Gestion d\'état', slug: '/documentation/guides/state-management' },
      { title: 'Routing', slug: '/documentation/guides/routing' },
    ],
  },
  {
    title: 'API',
    slug: '/documentation/api',
    items: [
      { title: 'Endpoints', slug: '/documentation/api/endpoints' },
      { title: 'Hooks', slug: '/documentation/api/hooks' },
      { title: 'Utilitaires', slug: '/documentation/api/utilities' },
    ],
  },
]

const LOCAL_STORAGE_KEY = 'klyra-docs-expanded-sections'

export function DocumentationNavigation() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  
  // Charger l'état sauvegardé depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        setExpandedSections(JSON.parse(saved))
      } else {
        // Par défaut, ouvrir la section active
        const activeSection = DOCUMENTATION_NAV.find(section => 
          pathname === section.slug || 
          pathname.startsWith(`${section.slug}/`)
        )
        
        if (activeSection) {
          setExpandedSections({ [activeSection.slug]: true })
        }
      }
    } catch (e) {
      console.error('Failed to load navigation state:', e)
    }
  }, [pathname])
  
  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (Object.keys(expandedSections).length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expandedSections))
      } catch (e) {
        console.error('Failed to save navigation state:', e)
      }
    }
  }, [expandedSections])
  
  const toggleSection = (slug: string) => {
    setExpandedSections(current => ({
      ...current,
      [slug]: !current[slug]
    }))
  }
  
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="docs-sidebar-header mb-6">
        <h3 className="text-xl font-bold text-[#1A2333]">Documentation</h3>
      </div>
      
      <nav className="space-y-1">
        {DOCUMENTATION_NAV.map((section) => (
          <div key={section.slug} className="mb-4">
            <div className="flex items-center justify-between">
              {section.items.length > 0 ? (
                <button
                  onClick={() => toggleSection(section.slug)}
                  className={cn(
                    "w-full flex items-center justify-between py-2 text-sm font-medium rounded",
                    pathname === section.slug || pathname.startsWith(`${section.slug}/`) ?
                      "text-[#467FF7] bg-[#EBF2FF] hover:bg-[#D8E6FF]" :
                      "text-[#1A2333] hover:bg-gray-50"
                  )}
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedSections[section.slug] ? "transform rotate-180" : ""
                    )} 
                  />
                </button>
              ) : (
                <Link
                  href={section.slug}
                  className={cn(
                    "block w-full py-2 text-sm font-medium rounded",
                    pathname === section.slug ?
                      "text-[#467FF7] bg-[#EBF2FF] hover:bg-[#D8E6FF]" :
                      "text-[#1A2333] hover:bg-gray-50"
                  )}
                >
                  {section.title}
                </Link>
              )}
            </div>
            
            {/* Sous-navigation */}
            {section.items.length > 0 && expandedSections[section.slug] && (
              <div className="mt-1 ml-4 space-y-1 border-l border-[#E2E8F0] pl-4">
                {section.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.slug}
                    className={cn(
                      "block py-2 text-sm",
                      pathname === item.slug ?
                        "text-[#467FF7] font-medium" :
                        "text-[#64748B] hover:text-[#467FF7]"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 