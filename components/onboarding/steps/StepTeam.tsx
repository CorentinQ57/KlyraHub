"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OnboardingData, Badge, StepProps } from '../types'

const teamSizes = [
  { id: "solo", label: "Solo" },
  { id: "small", label: "2-5 personnes" },
  { id: "medium", label: "6-15 personnes" },
  { id: "large", label: "16-50 personnes" },
  { id: "enterprise", label: "Plus de 50 personnes" }
]

const collaborationStyles = [
  { id: "agile", label: "Agile" },
  { id: "structured", label: "Structuré" },
  { id: "flexible", label: "Flexible" },
  { id: "remote", label: "Remote-first" },
  { id: "hybrid", label: "Hybride" }
]

export default function StepTeam({ data, onComplete, badges }: StepProps) {
  const [selectedTeamSize, setSelectedTeamSize] = useState(data.teamSize || '')
  const [selectedStyles, setSelectedStyles] = useState<string[]>(data.collaborationStyles || [])

  const handleStyleChange = (styleId: string) => {
    setSelectedStyles(current =>
      current.includes(styleId)
        ? current.filter(id => id !== styleId)
        : [...current, styleId]
    )
  }

  const handleSubmit = () => {
    onComplete({
      ...data,
      teamSize: selectedTeamSize,
      collaborationStyles: selectedStyles
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold"
        >
          Votre Équipe
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-muted-foreground"
        >
          Parlez-nous de vos préférences de collaboration
        </motion.p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Quelle est la taille de votre équipe ?
          </Label>
          <RadioGroup
            value={selectedTeamSize}
            onValueChange={setSelectedTeamSize}
            className="space-y-2"
          >
            {teamSizes.map(size => (
              <div key={size.id} className="flex items-center space-x-2">
                <RadioGroupItem value={size.id} id={size.id} />
                <Label htmlFor={size.id}>{size.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Quels sont vos styles de collaboration préférés ?
          </Label>
          <div className="space-y-2">
            {collaborationStyles.map(style => (
              <div key={style.id} className="flex items-center space-x-2">
                <Checkbox
                  id={style.id}
                  checked={selectedStyles.includes(style.id)}
                  onCheckedChange={() => handleStyleChange(style.id)}
                />
                <Label htmlFor={style.id}>{style.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={!selectedTeamSize || selectedStyles.length === 0}
        className="w-full"
      >
        Continuer
      </Button>
    </motion.div>
  )
} 