"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, ChevronRight, 
  BookOpen, Layers, Award, 
  CreditCard, HelpCircle, 
  FileText, ShoppingBag, FolderOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type NavigationItem = {
  title: string
  href?: string
  icon?: React.ReactNode
  badge?: 'new' | 'updated'
  items?: NavigationItem[]
}

const documentationItems: NavigationItem[] = [
  {
    title: 'Commencer',
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      { title: 'Introduction', href: '/documentation/introduction' },
      { title: 'Premiers pas', href: '/documentation/getting-started', badge: 'updated' },
      { title: 'FAQ', href: '/documentation/faq' }
    ]
  },
  {
    title: 'Services',
    icon: <ShoppingBag className="h-4 w-4" />,
    items: [
      { title: 'Vue d\'ensemble', href: '/documentation/services/overview' },
      { title: 'Branding', href: '/documentation/services/branding' },
      { title: 'Web Design', href: '/documentation/services/web-design' },
      { title: 'Stratégie digitale', href: '/documentation/services/digital-strategy' },
      { title: 'UX/UI Design', href: '/documentation/services/ux-ui-design', badge: 'new' },
    ]
  },
  {
    title: 'Projets',
    icon: <Layers className="h-4 w-4" />,
    items: [
      { title: 'Cycle de vie', href: '/documentation/projects/lifecycle' },
      { title: 'Suivi de projet', href: '/documentation/projects/tracking' },
      { title: 'Livrables', href: '/documentation/projects/deliverables' },
      { title: 'Commentaires', href: '/documentation/projects/comments' },
    ]
  },
  {
    title: 'Facturation',
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      { title: 'Méthodes de paiement', href: '/documentation/billing/payment-methods' },
      { title: 'Factures', href: '/documentation/billing/invoices' },
      { title: 'Historique', href: '/documentation/billing/history' },
    ]
  },
  {
    title: 'Support',
    icon: <HelpCircle className="h-4 w-4" />,
    items: [
      { title: 'Contact', href: '/documentation/support/contact' },
      { title: 'Dépannage', href: '/documentation/support/troubleshooting' },
      { title: 'Ressources', href: '/documentation/support/resources', badge: 'updated' },
    ]
  },
]

const NavigationGroup = ({ 
  item, 
  pathname, 
  isRoot = false,
  defaultOpen = false
}: { 
  item: NavigationItem
  pathname: string
  isRoot?: boolean
  defaultOpen?: boolean 
}) => {
  // Check if any child is active
  const hasActiveChild = item.items?.some(
    subItem => subItem.href && pathname.startsWith(subItem.href)
  )
  
  // Initialize open state based on active child or defaultOpen
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild)

  // Update open state when active child changes
  useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true)
    }
  }, [pathname, hasActiveChild, isOpen])

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full py-2 px-3 rounded-md text-sm font-medium transition-colors",
          isRoot 
            ? "hover:bg-[#EBF2FF] text-[#1A2333]" 
            : "hover:bg-[#F7FAFC] text-[#4A5568]",
          isOpen && "bg-[#EBF2FF] text-[#467FF7]"
        )}
      >
        <div className="flex items-center">
          {item.icon && (
            <span className={cn(
              "mr-2",
              isOpen ? "text-[#467FF7]" : "text-[#64748B]"
            )}>
              {item.icon}
            </span>
          )}
          <span className={isRoot ? "font-semibold" : ""}>{item.title}</span>
          
          {item.badge && (
            <span className={cn(
              "ml-2 px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide",
              item.badge === 'new' 
                ? "bg-[#E6EDFD] text-[#467FF7]" 
                : "bg-[#F0FDF4] text-[#22C55E]"
            )}>
              {item.badge}
            </span>
          )}
        </div>
        
        {item.items && (
          <span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && item.items && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "pl-4 ml-2 my-1 border-l",
              isRoot ? "border-[#E2E8F0]" : "border-[#EBF2FF]"
            )}>
              {item.items.map((subItem, idx) => (
                subItem.items ? (
                  <NavigationGroup 
                    key={idx} 
                    item={subItem} 
                    pathname={pathname} 
                  />
                ) : (
                  <Link
                    key={idx}
                    href={subItem.href || '#'}
                    className={cn(
                      "flex items-center py-1.5 px-3 my-1 rounded-md text-sm transition-colors",
                      pathname === subItem.href
                        ? "bg-[#EBF2FF] text-[#467FF7] font-medium"
                        : "text-[#4A5568] hover:bg-[#F7FAFC]"
                    )}
                  >
                    <span className="mr-2">
                      {subItem.icon || <FileText className="h-3.5 w-3.5 text-[#64748B]" />}
                    </span>
                    {subItem.title}
                    {subItem.badge && (
                      <span className={cn(
                        "ml-2 px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide",
                        subItem.badge === 'new' 
                          ? "bg-[#E6EDFD] text-[#467FF7]" 
                          : "bg-[#F0FDF4] text-[#22C55E]"
                      )}>
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DocumentationNavigation() {
  const pathname = usePathname()
  
  return (
    <div className="w-full py-2 bg-white border-r border-[#E2E8F0] h-full overflow-y-auto">
      <div className="px-3 mb-6">
        <div className="text-[#1A2333] font-semibold mb-1 flex items-center">
          <FolderOpen className="h-4 w-4 mr-2 text-[#467FF7]" />
          Documentation
        </div>
        <div className="text-[#64748B] text-xs">
          Guides et ressources pour KlyraDesign
        </div>
      </div>
      
      <div className="px-1">
        {documentationItems.map((item, idx) => (
          <NavigationGroup 
            key={idx} 
            item={item} 
            pathname={pathname} 
            isRoot={true}
            defaultOpen={idx === 0} // Ouvrir la première section par défaut
          />
        ))}
      </div>
    </div>
  )
} 