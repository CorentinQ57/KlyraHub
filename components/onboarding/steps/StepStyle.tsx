"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StepStyleProps {
  data: any
  onComplete: (data: any) => void
}

const visualStyles = [
  {
    id: 'minimal',
    name: 'Minimaliste',
    icon: '⚪',
    description: 'Épuré, moderne, efficace'
  },
  {
    id: 'bold',
    name: 'Audacieux',
    icon: '🎨',
    description: 'Coloré, expressif, unique'
  },
  {
    id: 'classic',
    name: 'Classique',
    icon: '✨',
    description: 'Élégant, professionnel, intemporel'
  },
  {
    id: 'playful',
    name: 'Ludique',
    icon: '🎮',
    description: 'Fun, dynamique, engageant'
  }
]

const communicationStyles = [
  { value: 'direct', label: 'Direct et concis' },
  { value: 'detailed', label: 'Détaillé et explicatif' },
  { value: 'casual', label: 'Décontracté et amical' },
  { value: 'formal', label: 'Formel et professionnel' }
]

const timeManagementStyles = [
  { value: 'flexible', label: 'Flexible et adaptable' },
  { value: 'structured', label: 'Structuré et planifié' },
  { value: 'deadline', label: 'Focalisé sur les deadlines' },
  { value: 'proactive', label: 'Proactif et anticipatif' }
]

export default function StepStyle({ data, onComplete }: StepStyleProps) {
  const [formData, setFormData] = useState({
    visualPreferences: data.visualPreferences || [],
    communicationStyle: data.communicationStyle || '',
    timeManagement: data.timeManagement || ''
  })

  const toggleVisualStyle = (styleId: string) => {
    const current = formData.visualPreferences
    const updated = current.includes(styleId)
      ? current.filter((id: string) => id !== styleId)
      : [...current, styleId]
    setFormData({ ...formData, visualPreferences: updated })
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
          <Label className="text-lg mb-4 block">
            Ton style visuel préféré (choisis-en 1 ou 2)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {visualStyles.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all ${
                  formData.visualPreferences.includes(style.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleVisualStyle(style.id)}
              >
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="font-medium mb-1">{style.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {style.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="communication" className="text-lg mb-2 block">
              Ton style de communication préféré
            </Label>
            <Select
              value={formData.communicationStyle}
              onValueChange={(value) =>
                setFormData({ ...formData, communicationStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisis ton style de communication" />
              </SelectTrigger>
              <SelectContent>
                {communicationStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timeManagement" className="text-lg mb-2 block">
              Ta relation avec les délais
            </Label>
            <Select
              value={formData.timeManagement}
              onValueChange={(value) =>
                setFormData({ ...formData, timeManagement: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisis ton approche des délais" />
              </SelectTrigger>
              <SelectContent>
                {timeManagementStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Parfait ! 🎨
        </Button>
      </form>
    </motion.div>
  )
} 