"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Étapes de l'onboarding
import StepIntroduction from './steps/StepIntroduction'
import StepProfessional from './steps/StepProfessional'
import StepAmbitions from './steps/StepAmbitions'
import StepStyle from './steps/StepStyle'
import StepFinal from './steps/StepFinal'

interface OnboardingData {
  fullName: string
  company: string
  teamSize: number
  sector: string
  experience: string
  webPresence: string[]
  priorities: string[]
  skills: Record<string, number>
  visualPreferences: string[]
  communicationStyle: string
  timeManagement: string
  avatarUrl: string
  socialLinks: Record<string, string>
  funFact: string
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    company: '',
    teamSize: 1,
    sector: '',
    experience: '',
    webPresence: [],
    priorities: [],
    skills: {},
    visualPreferences: [],
    communicationStyle: '',
    timeManagement: '',
    avatarUrl: '',
    socialLinks: {},
    funFact: ''
  })
  const [badges, setBadges] = useState<string[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const steps = [
    {
      component: StepIntroduction,
      title: "Faisons connaissance ! 👋",
      badge: "Nouveau Membre"
    },
    {
      component: StepProfessional,
      title: "Ton univers pro 🚀",
      badge: "Aventurier du Business"
    },
    {
      component: StepAmbitions,
      title: "Tes ambitions 🎯",
      badge: "Visionnaire Cool"
    },
    {
      component: StepStyle,
      title: "Ton style 🎨",
      badge: "Style Guru"
    },
    {
      component: StepFinal,
      title: "On y est presque ! 🎉",
      badge: "Membre de la famille Klyra"
    }
  ]

  const saveProgress = async (stepData: Partial<OnboardingData>) => {
    try {
      const updates = {
        id: user?.id,
        onboarding_data: { ...data, ...stepData },
        onboarding_step: currentStep,
        badges,
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: "Oups !",
        description: "On n'a pas pu sauvegarder tes progrès. On réessaie ?",
        variant: "destructive",
      })
    }
  }

  const handleStepComplete = async (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData }
    setData(newData)
    
    // Ajouter le badge de l'étape actuelle
    const newBadge = steps[currentStep].badge
    if (!badges.includes(newBadge)) {
      setBadges([...badges, newBadge])
    }

    await saveProgress(stepData)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {steps[currentStep].title}
        </h1>
        <Progress value={(currentStep + 1) * (100 / steps.length)} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <CurrentStepComponent
              data={data}
              onComplete={handleStepComplete}
              badges={badges}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {badges.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Tes badges 🏆</h3>
          <div className="flex gap-4 flex-wrap">
            {badges.map((badge) => (
              <div
                key={badge}
                className="px-4 py-2 bg-primary/10 rounded-full text-primary font-medium"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 