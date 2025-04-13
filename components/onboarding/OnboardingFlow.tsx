"use client"

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Rocket, Target, Palette, Users, Star, Trophy, Sparkles, ArrowRight, ArrowLeft, Award } from 'lucide-react'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Badge, OnboardingData, StepProps } from './types'

// Étapes de l'onboarding
import StepIntroduction from './steps/StepIntroduction'
import StepProfessional from './steps/StepProfessional'
import StepAmbitions from './steps/StepAmbitions'
import StepStyle from './steps/StepStyle'
import StepFinal from './steps/StepFinal'
import StepTeam from './steps/StepTeam'

interface Step {
  title: string
  description: string
  badge: Badge
  component: React.ComponentType<StepProps>
}

const steps: Step[] = [
  {
    title: "Welcome to Your Journey",
    description: "Let's start by getting to know you and your business",
    badge: {
      id: "pioneer",
      name: "Digital Pioneer",
      description: "First step into digital transformation",
      icon: "🚀"
    },
    component: StepIntroduction
  },
  {
    title: "Professional Profile",
    description: "Tell us about your professional background",
    badge: {
      id: "professional",
      name: "Professional Achiever",
      description: "Established professional identity",
      icon: "💼"
    },
    component: StepProfessional
  },
  {
    title: "Team Dynamics",
    description: "Let's understand your team structure and collaboration style",
    badge: {
      id: "team-player",
      name: "Team Player",
      description: "Mastering collaboration",
      icon: "👥"
    },
    component: StepTeam
  },
  {
    title: "Growth Ambitions",
    description: "Define your business goals and aspirations",
    badge: {
      id: "visionary",
      name: "Business Visionary",
      description: "Clear vision for growth",
      icon: "🎯"
    },
    component: StepAmbitions
  },
  {
    title: "Your Style",
    description: "Customize your experience",
    badge: {
      id: "stylist",
      name: "Digital Stylist",
      description: "Personalized digital presence",
      icon: "🎨"
    },
    component: StepStyle
  },
  {
    title: "Final Touch",
    description: "Add the finishing touches to your profile",
    badge: {
      id: "complete",
      name: "Profile Master",
      description: "Completed profile setup",
      icon: "✨"
    },
    component: StepFinal
  }
]

const badgeDescriptions = {
  "Nouveau Membre": "Bienvenue dans l'aventure Klyra ! 🎉",
  "Aventurier du Business": "Tu as partagé ton univers professionnel 🚀",
  "Visionnaire Cool": "Tu as défini tes objectifs stratégiques 🎯",
  "Style Guru": "Tu as exprimé ton style unique 🎨",
  "Membre de la famille Klyra": "Tu fais maintenant partie de la famille ! 💙"
}

export default function OnboardingFlow({ data: initialData, onComplete }: { data: OnboardingData; onComplete: (data: OnboardingData) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleStepComplete = (stepData: OnboardingData) => {
    const newData = { ...data, ...stepData }
    setData(newData)
    
    const currentBadge = steps[currentStep].badge
    if (currentBadge && !earnedBadges.find(b => b.name === currentBadge.name)) {
      setEarnedBadges([...earnedBadges, currentBadge])
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(newData)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  const saveProgress = async (stepData: Partial<OnboardingData>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          id: user?.id,
          onboarding_data: { ...data, ...stepData },
          onboarding_step: currentStep + 1,
          badges: earnedBadges.map(b => b.name),
          onboarding_completed: currentStep === steps.length - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: "Progression sauvegardée",
        description: "Vos données ont été enregistrées avec succès.",
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          {steps[currentStep].title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-500"
        >
          {steps[currentStep].description}
        </motion.p>
      </div>

      <Progress value={progress} className="w-full" />

      <Card className="p-6">
        <CurrentStepComponent
          data={data}
          onComplete={handleStepComplete}
          badges={earnedBadges}
        />
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <div className="flex space-x-2">
          {earnedBadges.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`p-2 rounded-full ${badge.color}`}
            >
              {badge.icon}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 