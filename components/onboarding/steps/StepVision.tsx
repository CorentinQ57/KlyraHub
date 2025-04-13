"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingData } from '../OnboardingFlow'

interface StepVisionProps {
  data: OnboardingData
  microStep: number
  onComplete: (data: OnboardingData) => void
}

const growthObjectives = [
  { id: "market", label: "Pénétration de marché" },
  { id: "revenue", label: "Augmentation du chiffre d'affaires" },
  { id: "brand", label: "Notoriété de la marque" },
  { id: "customers", label: "Acquisition de clients" },
  { id: "efficiency", label: "Optimisation des processus" }
]

const timelines = [
  { id: "3-months", label: "3 mois" },
  { id: "6-months", label: "6 mois" },
  { id: "1-year", label: "1 an" },
  { id: "2-years", label: "2 ans" },
  { id: "long-term", label: "Long terme (3+ ans)" }
]

const budgetRanges = [
  { id: "5k-10k", label: "5 000€ - 10 000€" },
  { id: "10k-25k", label: "10 000€ - 25 000€" },
  { id: "25k-50k", label: "25 000€ - 50 000€" },
  { id: "50k-100k", label: "50 000€ - 100 000€" },
  { id: "100k+", label: "Plus de 100 000€" }
]

export default function StepVision({ data, microStep, onComplete }: StepVisionProps) {
  const [formData, setFormData] = useState({
    growthObjectives: data.growthObjectives || [],
    timeline: data.timeline || '',
    budget: data.budget || ''
  })

  const handleComplete = () => {
    onComplete({ ...data, ...formData })
  }

  const renderMicroStep = () => {
    switch (microStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Label className="text-lg font-medium">Objectifs de croissance</Label>
            <div className="grid grid-cols-2 gap-4">
              {growthObjectives.map((objective) => (
                <Label
                  key={objective.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.growthObjectives.includes(objective.id) ? 'border-primary bg-primary/5' : 'border-input'
                  }`}
                >
                  <Checkbox
                    checked={formData.growthObjectives.includes(objective.id)}
                    onCheckedChange={(checked) => {
                      const newObjectives = checked
                        ? [...formData.growthObjectives, objective.id]
                        : formData.growthObjectives.filter(o => o !== objective.id)
                      setFormData({ ...formData, growthObjectives: newObjectives })
                      if (newObjectives.length > 0) {
                        handleComplete()
                      }
                    }}
                  />
                  <span>{objective.label}</span>
                </Label>
              ))}
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Label className="text-lg font-medium">Timeline du projet</Label>
            <RadioGroup
              value={formData.timeline}
              onValueChange={(value) => {
                setFormData({ ...formData, timeline: value })
                handleComplete()
              }}
              className="space-y-3"
            >
              {timelines.map((timeline) => (
                <Label
                  key={timeline.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.timeline === timeline.id ? 'border-primary bg-primary/5' : 'border-input'
                  }`}
                >
                  <RadioGroupItem value={timeline.id} id={timeline.id} />
                  <span>{timeline.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Label className="text-lg font-medium">Budget envisagé</Label>
            <RadioGroup
              value={formData.budget}
              onValueChange={(value) => {
                setFormData({ ...formData, budget: value })
                handleComplete()
              }}
              className="space-y-3"
            >
              {budgetRanges.map((budget) => (
                <Label
                  key={budget.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.budget === budget.id ? 'border-primary bg-primary/5' : 'border-input'
                  }`}
                >
                  <RadioGroupItem value={budget.id} id={budget.id} />
                  <span>{budget.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </motion.div>
        )

      default:
        return null
    }
  }

  return renderMicroStep()
} 