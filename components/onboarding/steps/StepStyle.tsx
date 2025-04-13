"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

interface Style {
  id: string
  name: string
  description: string
}

interface CommunicationStyle {
  id: string
  label: string
  description: string
}

interface StepStyleProps {
  data: any
  onComplete: (data: any) => void
}

interface FormData {
  visualPreferences: string[]
  communicationStyle: string
  timeManagement: number
}

const styles: Style[] = [
  {
    id: 'minimal',
    name: 'Minimaliste & Épuré',
    description: 'Des designs simples, épurés, avec beaucoup d\'espace blanc'
  },
  {
    id: 'modern',
    name: 'Moderne & Dynamique',
    description: 'Des designs contemporains avec des animations et des interactions'
  },
  {
    id: 'classic',
    name: 'Classique & Élégant',
    description: 'Des designs traditionnels avec une touche de sophistication'
  },
  {
    id: 'bold',
    name: 'Audacieux & Expressif',
    description: 'Des designs qui attirent l\'attention avec des couleurs vives'
  }
]

const communicationStyles: CommunicationStyle[] = [
  {
    id: 'direct',
    label: 'Direct & Concis',
    description: 'Je préfère une communication claire et directe'
  },
  {
    id: 'detailed',
    label: 'Détaillé & Complet',
    description: 'J\'aime avoir tous les détails et le contexte'
  },
  {
    id: 'collaborative',
    label: 'Collaboratif & Ouvert',
    description: 'Je préfère un dialogue continu et des échanges réguliers'
  },
  {
    id: 'autonomous',
    label: 'Autonome & Flexible',
    description: 'Je préfère une approche plus indépendante'
  }
]

export default function StepStyle({ data, onComplete }: StepStyleProps) {
  const [formData, setFormData] = useState<FormData>({
    visualPreferences: data.visualPreferences || [],
    communicationStyle: data.communicationStyle || '',
    timeManagement: data.timeManagement || 3
  })

  const handleStyleToggle = (styleId: string) => {
    const current = formData.visualPreferences
    const updated = current.includes(styleId)
      ? current.filter((id: string) => id !== styleId)
      : [...current, styleId]
    setFormData({ ...formData, visualPreferences: updated })
  }

  const handleCommunicationChange = (value: string) => {
    setFormData({ ...formData, communicationStyle: value })
  }

  const handleTimeManagementChange = (value: number[]) => {
    setFormData({ ...formData, timeManagement: value[0] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label className="text-lg mb-4 block">Tes préférences visuelles</Label>
          <div className="space-y-4">
            {styles.map((style) => (
              <div
                key={style.id}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50"
              >
                <Checkbox
                  id={style.id}
                  checked={formData.visualPreferences.includes(style.id)}
                  onCheckedChange={() => handleStyleToggle(style.id)}
                />
                <div className="space-y-1">
                  <label
                    htmlFor={style.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {style.name}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg mb-4 block">Ton style de communication</Label>
          <RadioGroup
            value={formData.communicationStyle}
            onValueChange={handleCommunicationChange}
            className="space-y-4"
          >
            {communicationStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50"
              >
                <RadioGroupItem value={style.id} id={style.id} />
                <div className="space-y-1">
                  <label
                    htmlFor={style.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {style.label}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg mb-4 block">
            Ton approche de la gestion du temps
          </Label>
          <div className="space-y-4">
            <Slider
              value={[formData.timeManagement]}
              min={1}
              max={5}
              step={1}
              onValueChange={handleTimeManagementChange}
              className="py-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Flexible</span>
              <span>Strict</span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Suivant 🎯
        </Button>
      </form>
    </motion.div>
  )
} 