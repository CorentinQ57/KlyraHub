"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { createProject } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function PaymentSuccessPage() {
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [projectCreated, setProjectCreated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  
  // Récupérer les paramètres de l'URL
  const sessionId = searchParams.get('session_id')
  const serviceId = searchParams.get('service_id')
  const title = searchParams.get('title')
  const price = searchParams.get('price')
  
  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!isLoading && !user) {
      console.log("Utilisateur non authentifié, redirection vers login");
      router.push('/login')
      return
    }
    
    // Log pour le debug
    console.log("PaymentSuccess - Paramètres:", { 
      sessionId, 
      serviceId, 
      title, 
      price, 
      userId: user?.id 
    });
    
    // Créer le projet si nécessaire (au cas où le webhook n'aurait pas été traité)
    const handleProjectCreation = async () => {
      if (user && sessionId && serviceId && title && price && !projectCreated && !isCreatingProject) {
        try {
          setIsCreatingProject(true)
          console.log("Tentative de création du projet...");
          
          // Créer le projet dans Supabase
          const project = await createProject(
            user.id,
            serviceId,
            title,
            parseInt(price)
          )
          
          if (project) {
            setProjectCreated(true)
            console.log('Projet créé avec succès:', project)
          } else {
            // Le projet peut déjà avoir été créé par le webhook
            console.log('Le projet n\'a pas été créé, il existe peut-être déjà')
            setProjectCreated(true)
          }
        } catch (err) {
          console.error('Erreur lors de la création du projet:', err)
          setError('Une erreur est survenue lors de la création de votre projet.')
        } finally {
          setIsCreatingProject(false)
        }
      } else {
        console.log("Conditions non remplies pour la création:", {
          hasUser: !!user,
          hasSessionId: !!sessionId,
          hasServiceId: !!serviceId,
          hasTitle: !!title,
          hasPrice: !!price,
          alreadyCreated: projectCreated,
          isCreating: isCreatingProject
        });
      }
    }
    
    if (user && sessionId) {
      handleProjectCreation()
    }
  }, [user, isLoading, sessionId, serviceId, title, price, projectCreated, isCreatingProject, router])
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-klyra">Klyra</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-klyra">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="text-sm font-medium transition-colors hover:text-klyra">
                Profil
              </Link>
              <Link href="/dashboard/marketplace" className="text-sm font-medium transition-colors hover:text-klyra">
                Marketplace
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.1 
            }}
            className="w-24 h-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-8 text-4xl"
          >
            ✓
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Paiement réussi !
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Merci pour votre achat. Votre projet "{title}" a été créé et notre équipe va le prendre en charge très prochainement.
          </motion.p>
          
          {error && (
            <motion.div 
              className="bg-red-50 text-red-700 p-4 rounded-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="bg-klyra hover:bg-klyra/90"
            >
              Voir mes projets
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push('/dashboard/marketplace')}
            >
              Explorer d'autres services
            </Button>
          </motion.div>
          
          <motion.p 
            className="mt-16 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Une confirmation a également été envoyée à votre adresse email.
          </motion.p>
        </div>
      </main>
    </div>
  )
} 