"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader, PageSection } from '@/components/ui/page-container'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/use-toast'
import ProgressBar from '@/components/onboarding/ProgressBar'
import StepWelcome from '@/components/onboarding/steps/StepWelcome'
import StepProfile from '@/components/onboarding/steps/StepProfile'
import StepStyle from '@/components/onboarding/steps/StepStyle'
import StepSummary from '@/components/onboarding/steps/StepSummary'

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
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleStepComplete = (stepData: any) => {
    // Update formData with the new data from the current step
    setFormData({
      ...formData,
      ...stepData
    })
    
    // If it's the last step, submit the onboarding data
    if (currentStep === steps.length - 1) {
      handleSubmitOnboarding({
        ...formData,
        ...stepData
      })
    } else {
      // Otherwise, go to the next step
      goToNextStep()
    }
  }
  
  const handleSubmitOnboarding = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your backend
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success toast
      toast({
        title: "Profil complété !",
        description: "Bienvenue sur Klyra Hub. Vos préférences ont été enregistrées.",
        duration: 5000,
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      toast({
        title: "Une erreur est survenue",
        description: "Impossible d'enregistrer vos informations. Veuillez réessayer.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
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
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement...</p>
          </div>
        </div>
      </PageContainer>
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