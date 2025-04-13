"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'

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

const badgeDescriptions = {
  "Nouveau Membre": "Bienvenue dans l'aventure Klyra ! 🎉",
  "Aventurier du Business": "Tu as partagé ton univers professionnel 🚀",
  "Visionnaire Cool": "Tu as défini tes objectifs stratégiques 🎯",
  "Style Guru": "Tu as exprimé ton style unique 🎨",
  "Membre de la famille Klyra": "Tu fais maintenant partie de la famille ! 💙"
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
      badge: "Nouveau Membre",
      description: "Première étape vers une identité visuelle unique"
    },
    {
      component: StepProfessional,
      title: "Ton univers pro 🚀",
      badge: "Aventurier du Business",
      description: "Comprendre ton secteur et tes besoins"
    },
    {
      component: StepAmbitions,
      title: "Tes ambitions 🎯",
      badge: "Visionnaire Cool",
      description: "Définir tes objectifs stratégiques"
    },
    {
      component: StepStyle,
      title: "Ton style 🎨",
      badge: "Style Guru",
      description: "Exprimer ta personnalité visuelle"
    },
    {
      component: StepFinal,
      title: "On y est presque ! 🎉",
      badge: "Membre de la famille Klyra",
      description: "Finaliser ton profil unique"
    }
  ]

  const saveProgress = async (stepData: Partial<OnboardingData>) => {
    try {
      const updates = {
        id: user?.id,
        onboarding_data: { ...data, ...stepData },
        onboarding_step: currentStep,
        badges,
        onboarding_completed: currentStep === steps.length - 1,
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
      // Lancer les confettis pour le nouveau badge
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      // Afficher un toast pour le badge
      toast({
        title: `🏆 Nouveau badge débloqué !`,
        description: badgeDescriptions[newBadge as keyof typeof badgeDescriptions],
      })
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
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {steps[currentStep].title}
        </h1>
        <p className="text-muted-foreground mb-4">
          {steps[currentStep].description}
        </p>
        <div className="relative">
          <Progress 
            value={(currentStep + 1) * (100 / steps.length)} 
            className="h-2" 
          />
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  index <= currentStep ? 'bg-primary text-white' : 'bg-muted'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 border-2 hover:border-primary/50 transition-all">
            <CurrentStepComponent
              data={data}
              onComplete={handleStepComplete}
              badges={badges}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {badges.length > 0 && (
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Tes badges 
            <span className="text-2xl">🏆</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge}
                className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="font-medium text-primary mb-1">{badge}</div>
                <p className="text-sm text-muted-foreground">
                  {badgeDescriptions[badge as keyof typeof badgeDescriptions]}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
} 