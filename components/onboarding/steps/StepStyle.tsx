"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Palette, MessageSquare, Heart, Sparkles } from 'lucide-react'
import { OnboardingData, Badge, StepProps } from '../types'

interface StepStyleProps {
  data: {
    visualStyle?: string
    communicationTone?: string
    companyValues?: string[]
    inspirations?: string[]
  }
  setData: (data: any) => void
}

const visualStyles = [
  {
    value: 'minimal',
    label: 'Minimaliste & Épuré',
    description: 'Design simple et élégant, espaces blancs, typographie soignée',
    icon: <Palette className="w-4 h-4" />
  },
  {
    value: 'bold',
    label: 'Bold & Impactant',
    description: 'Couleurs vives, contrastes forts, éléments graphiques marqués',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    value: 'creative',
    label: 'Créatif & Innovant',
    description: 'Designs uniques, animations originales, approche artistique',
    icon: <Heart className="w-4 h-4" />
  },
  {
    value: 'corporate',
    label: 'Corporate & Professionnel',
    description: 'Style business, couleurs sobres, mise en page structurée',
    icon: <MessageSquare className="w-4 h-4" />
  }
]

const communicationTones = [
  {
    value: 'professional',
    label: 'Professionnel',
    description: 'Ton formel et expert, vocabulaire technique précis'
  },
  {
    value: 'friendly',
    label: 'Amical & Accessible',
    description: 'Communication chaleureuse et proche du client'
  },
  {
    value: 'innovative',
    label: 'Innovant & Disruptif',
    description: 'Ton moderne et avant-gardiste, vocabulaire tech'
  },
  {
    value: 'educational',
    label: 'Pédagogique',
    description: 'Explications claires, approche didactique'
  }
]

const companyValues = [
  'Innovation',
  'Excellence',
  'Authenticité',
  'Collaboration',
  'Créativité',
  'Performance',
  'Durabilité',
  'Proximité'
]

export default function StepStyle({ data, setData }: StepStyleProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(data.companyValues || [])
  const [newInspiration, setNewInspiration] = useState('')

  const handleValueClick = (value: string) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        const newValues = prev.filter(v => v !== value)
        setData({ ...data, companyValues: newValues })
        return newValues
      }
      if (prev.length < 3) {
        const newValues = [...prev, value]
        setData({ ...data, companyValues: newValues })
        return newValues
      }
      return prev
    })
  }

  const handleAddInspiration = () => {
    if (newInspiration.trim()) {
      const newInspirations = [...(data.inspirations || []), newInspiration.trim()]
      setData({ ...data, inspirations: newInspirations })
      setNewInspiration('')
    }
  }

  const removeInspiration = (index: number) => {
    const newInspirations = (data.inspirations || []).filter((_, i) => i !== index)
    setData({ ...data, inspirations: newInspirations })
  }

  return (
    <div className="space-y-8">
      {/* Style visuel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quel style visuel correspond le mieux à votre marque ?
        </Label>
        <RadioGroup
          value={data.visualStyle}
          onValueChange={(value) => setData({ ...data, visualStyle: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {visualStyles.map((style) => (
            <Label
              key={style.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.visualStyle === style.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={style.value} id={style.value} className="sr-only" />
              <div className="flex items-center justify-between mb-2">
                {style.icon}
                <span className="font-medium">{style.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{style.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Ton de communication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quel ton de communication préférez-vous adopter ?
        </Label>
        <RadioGroup
          value={data.communicationTone}
          onValueChange={(value) => setData({ ...data, communicationTone: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {communicationTones.map((tone) => (
            <Label
              key={tone.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.communicationTone === tone.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={tone.value} id={tone.value} className="sr-only" />
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{tone.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{tone.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Valeurs de l'entreprise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Sélectionnez jusqu'à 3 valeurs qui définissent votre entreprise
        </Label>
        <div className="flex flex-wrap gap-2">
          {companyValues.map((value) => (
            <Button
              key={value}
              variant="outline"
              size="sm"
              className={`transition-all ${
                selectedValues.includes(value)
                  ? 'bg-primary text-primary-foreground'
                  : selectedValues.length >= 3
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onClick={() => handleValueClick(value)}
              disabled={selectedValues.length >= 3 && !selectedValues.includes(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Inspirations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Ajoutez des références ou sources d'inspiration
        </Label>
        <div className="flex gap-2">
          <Input
            value={newInspiration}
            onChange={(e) => setNewInspiration(e.target.value)}
            placeholder="Ex: Apple.com, Airbnb..."
            className="flex-1"
          />
          <Button onClick={handleAddInspiration} disabled={!newInspiration.trim()}>
            Ajouter
          </Button>
        </div>
        {data.inspirations && data.inspirations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.inspirations.map((inspiration, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className="group"
                onClick={() => removeInspiration(index)}
              >
                {inspiration}
                <span className="ml-2 opacity-0 group-hover:opacity-100">×</span>
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Message de conseil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            Parfait ! Ces choix nous permettront de créer une identité visuelle et une
            communication parfaitement alignées avec vos valeurs et votre vision.
            Notre équipe créative s'inspirera de ces éléments pour donner vie à votre marque.
          </p>
        </Card>
      </motion.div>
    </div>
  )
} 