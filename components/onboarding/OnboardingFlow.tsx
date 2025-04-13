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
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react'

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
      description: "Première étape vers une identité visuelle unique",
      icon: "🎨"
    },
    {
      component: StepProfessional,
      title: "Ton univers pro 🚀",
      badge: "Aventurier du Business",
      description: "Comprendre ton secteur et tes besoins",
      icon: "💼"
    },
    {
      component: StepAmbitions,
      title: "Tes ambitions 🎯",
      badge: "Visionnaire Cool",
      description: "Définir tes objectifs stratégiques",
      icon: "🎯"
    },
    {
      component: StepStyle,
      title: "Ton style 🎨",
      badge: "Style Guru",
      description: "Exprimer ta personnalité visuelle",
      icon: "✨"
    },
    {
      component: StepFinal,
      title: "On y est presque ! 🎉",
      badge: "Membre de la famille Klyra",
      description: "Finaliser ton profil unique",
      icon: "🌟"
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12">
        <motion.h1 
          className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {steps[currentStep].title}
        </motion.h1>
        <motion.p 
          className="text-lg text-muted-foreground mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {steps[currentStep].description}
        </motion.p>
        
        <div className="relative mb-12">
          <Progress 
            value={(currentStep + 1) * (100 / steps.length)} 
            className="h-2" 
          />
          <div className="absolute -bottom-8 left-0 right-0 flex justify-between">
            {steps.map((step, index) => (
              <motion.button
                key={index}
                onClick={() => index <= Math.max(...badges.map(b => steps.findIndex(s => s.badge === b)), 0) && setCurrentStep(index)}
                className={`flex flex-col items-center group transition-all duration-300 ${
                  index <= Math.max(...badges.map(b => steps.findIndex(s => s.badge === b)), 0) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  transition-all duration-300 mb-2
                  ${index === currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index < currentStep 
                      ? 'bg-primary/20 border-primary/50 text-primary' 
                      : 'bg-muted border-muted-foreground/20'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>
                <span className={`
                  text-xs font-medium transition-all duration-300
                  ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  Étape {index + 1}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Card className="p-8 border-2 hover:border-primary/50 transition-all shadow-lg">
              <CurrentStepComponent
                data={data}
                onComplete={handleStepComplete}
                badges={badges}
              />
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={() => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1)}
            disabled={currentStep === steps.length - 1 || !badges.includes(steps[currentStep].badge)}
            className="flex items-center gap-2"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {badges.length > 0 && (
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            Tes badges 
            <span className="text-3xl">🏆</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <motion.div
                key={badge}
                className="p-6 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/30 transition-all"
                whileHover={{ scale: 1.02, rotate: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="font-semibold text-primary mb-2 text-lg">{badge}</div>
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