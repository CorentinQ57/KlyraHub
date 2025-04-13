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
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Rocket, Target, Palette, Users, Star, Trophy, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Étapes de l'onboarding
import StepIntroduction from './steps/StepIntroduction'
import StepProfessional from './steps/StepProfessional'
import StepAmbitions from './steps/StepAmbitions'
import StepStyle from './steps/StepStyle'
import StepFinal from './steps/StepFinal'
import StepVision from './steps/StepVision'
import StepTeam from './steps/StepTeam'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  badge: {
    name: string
    description: string
    icon: React.ReactNode
    color: string
  }
}

export interface OnboardingData {
  // Étape 1 - Introduction
  sector?: string
  companySize?: string
  projectType?: string[]
  
  // Étape 2 - Vision
  growthObjectives?: string[]
  timeline?: string
  budget?: string
  challenges?: string[]
  
  // Étape 3 - Style
  visualStyle?: string
  communicationTone?: string
  companyValues?: string[]
  inspirations?: string[]
  
  // Étape 4 - Équipe
  teamSize?: string
  keyRoles?: string[]
  validationProcess?: string
  communicationFrequency?: string
  
  // Étape 5 - Finalisation
  avatarUrl?: string
  companyBio?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  timezone?: string
  availability?: string[]
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Bienvenue chez Klyra",
    description: "Commençons cette aventure ensemble ! Nous allons personnaliser votre expérience pour vous offrir le meilleur de notre expertise en design et stratégie digitale.",
    icon: <Rocket className="w-8 h-8 text-primary" />,
    badge: {
      name: "Pionnier Digital",
      description: "Premier pas vers l'excellence digitale",
      icon: <Sparkles />,
      color: "bg-gradient-to-r from-blue-500 to-purple-500"
    }
  },
  {
    id: 2,
    title: "Votre Vision",
    description: "Partagez vos ambitions et objectifs. Nous adapterons notre approche pour maximiser votre impact sur le marché.",
    icon: <Target className="w-8 h-8 text-primary" />,
    badge: {
      name: "Visionnaire",
      description: "Objectifs clairs, résultats exceptionnels",
      icon: <Trophy />,
      color: "bg-gradient-to-r from-emerald-500 to-blue-500"
    }
  },
  {
    id: 3,
    title: "Style & Communication",
    description: "Définissons l'identité unique de votre marque à travers son style visuel et sa voix.",
    icon: <Palette className="w-8 h-8 text-primary" />,
    badge: {
      name: "Style Master",
      description: "Expert en identité de marque",
      icon: <Star />,
      color: "bg-gradient-to-r from-pink-500 to-orange-500"
    }
  },
  {
    id: 4,
    title: "Votre Équipe",
    description: "Optimisons notre collaboration en comprenant la structure et les besoins de votre équipe.",
    icon: <Users className="w-8 h-8 text-primary" />,
    badge: {
      name: "Team Player",
      description: "Collaboration efficace activée",
      icon: <Users />,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    }
  },
  {
    id: 5,
    title: "Finalisation",
    description: "Dernière étape pour personnaliser votre profil et préparer le lancement de nos futurs projets ensemble.",
    icon: <Star className="w-8 h-8 text-primary" />,
    badge: {
      name: "Ready to Launch",
      description: "Prêt pour l'excellence",
      icon: <Rocket />,
      color: "bg-gradient-to-r from-yellow-500 to-red-500"
    }
  }
]

const badgeDescriptions = {
  "Nouveau Membre": "Bienvenue dans l'aventure Klyra ! 🎉",
  "Aventurier du Business": "Tu as partagé ton univers professionnel 🚀",
  "Visionnaire Cool": "Tu as défini tes objectifs stratégiques 🎯",
  "Style Guru": "Tu as exprimé ton style unique 🎨",
  "Membre de la famille Klyra": "Tu fais maintenant partie de la famille ! 💙"
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({})
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const progress = (currentStep / steps.length) * 100

  const earnBadge = (badgeName: string) => {
    if (!earnedBadges.includes(badgeName)) {
      setEarnedBadges([...earnedBadges, badgeName])
      setShowBadgeAnimation(true)
      setTimeout(() => setShowBadgeAnimation(false), 3000)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      earnBadge(steps[currentStep - 1].badge.name)
      setCurrentStep(currentStep + 1)
    } else {
      earnBadge(steps[currentStep - 1].badge.name)
      saveProgress(data)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveProgress = async (stepData: Partial<OnboardingData>) => {
    try {
      const updates = {
        id: user?.id,
        onboarding_data: { ...data, ...stepData },
        onboarding_step: currentStep,
        badges: earnedBadges,
        onboarding_completed: currentStep === steps.length,
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header avec progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <motion.h1 
            className="text-3xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {steps[currentStep - 1].title}
          </motion.h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Étape {currentStep} sur {steps.length}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <motion.p 
          className="mt-4 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {steps[currentStep - 1].description}
        </motion.p>
      </div>

      {/* Contenu principal */}
      <Card className="p-6 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <StepIntroduction data={data} setData={(newData: OnboardingData) => {
              setData(newData)
              handleNext()
            }} />}
            {currentStep === 2 && <StepVision data={data} setData={(newData: OnboardingData) => {
              setData(newData)
              handleNext()
            }} />}
            {currentStep === 3 && <StepStyle data={data} setData={(newData: OnboardingData) => {
              setData(newData)
              handleNext()
            }} />}
            {currentStep === 4 && <StepTeam data={data} setData={(newData: OnboardingData) => {
              setData(newData)
              handleNext()
            }} />}
            {currentStep === 5 && <StepFinal data={data} setData={(newData: OnboardingData) => {
              setData(newData)
              handleNext()
            }} />}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length ? 'Terminer' : 'Suivant'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Badges gagnés */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Badges débloqués</h3>
        <div className="flex flex-wrap gap-4">
          {earnedBadges.map((badgeName) => {
            const badge = steps.find(step => step.badge.name === badgeName)?.badge
            if (!badge) return null
            
            return (
              <motion.div
                key={badgeName}
                className={`rounded-full px-4 py-2 text-white flex items-center gap-2 ${badge.color}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {badge.icon}
                <span>{badge.name}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Animation de badge débloqué */}
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <Trophy className="h-6 w-6" />
            <div>
              <p className="font-semibold">Nouveau badge débloqué !</p>
              <p className="text-sm">{steps[currentStep - 1].badge.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 