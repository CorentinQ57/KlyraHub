"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DocumentationNavigation } from '@/components/ui/documentation-navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()
  
  // Close mobile nav when pathname changes
  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])
  
  // Close mobile nav when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileNavOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Mobile navigation toggle */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E2E8F0] p-4">
        <button 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="flex items-center text-[#1A2333] font-medium"
        >
          {isMobileNavOpen ? (
            <X className="h-5 w-5 mr-2" />
          ) : (
            <Menu className="h-5 w-5 mr-2" />
          )}
          Documentation
        </button>
      </div>
      
      <div className="flex flex-1">
        {/* Side navigation - hidden on mobile unless toggled */}
        <div 
          className={cn(
            "fixed inset-0 z-20 lg:relative lg:block bg-white",
            isMobileNavOpen ? "block" : "hidden"
          )}
        >
          <div className="w-64 lg:w-72 h-full">
            <DocumentationNavigation />
          </div>
        </div>
        
        {/* Mobile overlay */}
        {isMobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="flex-1 pt-6 px-4 lg:px-8 max-w-5xl mx-auto w-full">
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
} 