"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader, PageSection } from '@/components/ui/page-container'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/use-toast'
import { saveOnboardingData } from '@/lib/supabase'
import ProgressBar from '@/components/onboarding/ProgressBar'
import StepWelcome from '@/components/onboarding/steps/StepWelcome'
import StepProfile from '@/components/onboarding/steps/StepProfile'
import StepStyle from '@/components/onboarding/steps/StepStyle'
import StepSummary from '@/components/onboarding/steps/StepSummary'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Composant Spinner simple pour le chargement
const Spinner = ({ className = "" }: { className?: string }) => (
  <div className={`h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary ${className}`}></div>
);

const steps = [
  "Bienvenue",
  "Profil & Besoins",
  "Préférences",
  "Récapitulatif"
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [pageLoadingTimedOut, setPageLoadingTimedOut] = useState(false)
  
  // Ajouter un timeout de sécurité pour l'onboarding
  useEffect(() => {
    console.log("Setting up page loading safety timeout")
    const timeoutId = setTimeout(() => {
      if (!pageLoaded && isLoading) {
        console.log("⚠️ Onboarding page loading safety timeout triggered")
        setPageLoadingTimedOut(true)
      }
    }, 5000) // 5 secondes d'attente maximum
    
    return () => clearTimeout(timeoutId)
  }, [pageLoaded, isLoading])
  
  // Effet pour gérer les redirections
  useEffect(() => {
    console.log("Onboarding Page - Auth state:", { 
      isLoading, 
      userExists: !!user, 
      userEmail: user?.email,
      timedOut: pageLoadingTimedOut
    })
    
    // Si le timeout de chargement est atteint, on force l'affichage de la page
    if (pageLoadingTimedOut) {
      console.log("Forcing page to load despite auth issues")
      setPageLoaded(true)
      return
    }
    
    // Attendre la fin du chargement de l'auth
    if (isLoading) {
      console.log("Waiting for auth to finish loading...")
      return
    }

    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!user) {
      console.log("Onboarding: No user detected, redirecting to login")
      router.push('/login')
      return
    }
    
    // Si l'utilisateur a déjà complété l'onboarding, rediriger vers dashboard
    if (user.user_metadata?.onboarded) {
      console.log("Onboarding: User already onboarded, redirecting to dashboard")
      router.push('/dashboard')
      return
    }
    
    // Tout est OK, afficher la page
    console.log("Onboarding: Page ready to display for", user.email)
    setPageLoaded(true)
  }, [isLoading, user, router, pageLoadingTimedOut])
  
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])
  
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])
  
  const handleStepComplete = useCallback((stepData: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData
    }))
    
    if (currentStep === steps.length - 1) {
      handleSubmitOnboarding({
        ...formData,
        ...stepData
      })
    } else {
      goToNextStep()
    }
  }, [currentStep, formData, goToNextStep])
  
  const handleSubmitOnboarding = async (data: any) => {
    if (!user) {
      console.error("Cannot submit onboarding - no user")
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour continuer. Veuillez vous reconnecter.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }
    
    try {
      setIsSubmitting(true)
      console.log("Saving onboarding data for user:", user.email)
      
      await saveOnboardingData(user.id, {
        fullName: data.fullName,
        onboarded: true,
        // Autres champs du profile issus du data
        companyName: data.companyName,
        phone: data.phone,
        goals: data.goals,
        sector: data.sector,
        companySize: data.companySize,
        needsBranding: data.needsBranding,
        needsWebsite: data.needsWebsite,
        needsMarketing: data.needsMarketing,
        visualPreferences: data.visualPreferences,
        communicationStyle: data.communicationStyle,
        timeManagement: data.timeManagement
      })
      
      console.log("Onboarding data saved successfully")
      
      toast({
        title: "Profil mis à jour",
        description: "Bienvenue sur Klyra Design!",
      })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error("Error saving onboarding data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos informations. Veuillez réessayer.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome data={formData} onComplete={handleStepComplete} />
      case 1:
        return <StepProfile data={formData} onComplete={handleStepComplete} />
      case 2:
        return <StepStyle data={formData} onComplete={handleStepComplete} />
      case 3:
        return <StepSummary data={formData} onComplete={handleStepComplete} />
      default:
        return null
    }
  }
  
  if (isLoading && !pageLoadingTimedOut) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center">
        <Spinner className="mb-4" />
        <p>Préparation de votre profil...</p>
      </div>
    )
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Bienvenue sur Klyra Hub"
        description="Configurons votre profil en quelques étapes simples"
      />
      
      <div className="max-w-4xl mx-auto">
        <ProgressBar steps={steps} currentStep={currentStep} />
        
        <PageSection className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              
              <Button
                onClick={goToNextStep}
                disabled={currentStep === steps.length - 1 || isSubmitting}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </PageSection>
      </div>
    </PageContainer>
  )
} 