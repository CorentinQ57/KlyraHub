"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type NavigationContextType = {
  openSections: Record<string, boolean>
  toggleSection: (sectionId: string) => void
  isDocumentationOpen: boolean
  setIsDocumentationOpen: (isOpen: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Récupérer l'état des sections depuis le localStorage si disponible
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [isDocumentationOpen, setIsDocumentationOpen] = useState<boolean>(false)
  
  // Charger l'état sauvegardé des sections au montage du composant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSections = localStorage.getItem('klyra-nav-sections')
        if (savedSections) {
          setOpenSections(JSON.parse(savedSections))
        }
        
        const savedDocState = localStorage.getItem('klyra-doc-open')
        if (savedDocState) {
          setIsDocumentationOpen(JSON.parse(savedDocState))
        }
      } catch (error) {
        console.error('Error loading navigation state from localStorage:', error)
      }
    }
  }, [])
  
  // Sauvegarder l'état des sections quand il change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(openSections).length > 0) {
      try {
        localStorage.setItem('klyra-nav-sections', JSON.stringify(openSections))
      } catch (error) {
        console.error('Error saving navigation state to localStorage:', error)
      }
    }
  }, [openSections])
  
  // Sauvegarder l'état de l'ouverture de la documentation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('klyra-doc-open', JSON.stringify(isDocumentationOpen))
      } catch (error) {
        console.error('Error saving documentation state to localStorage:', error)
      }
    }
  }, [isDocumentationOpen])
  
  // Fonction pour basculer l'état d'une section
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }
  
  return (
    <NavigationContext.Provider 
      value={{ 
        openSections, 
        toggleSection, 
        isDocumentationOpen, 
        setIsDocumentationOpen 
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
} 