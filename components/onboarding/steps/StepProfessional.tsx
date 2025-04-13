"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface StepProfessionalProps {
  data: any
  onComplete: (data: any) => void
}

const sectors = [
  { id: 'tech', name: 'Tech & Digital', icon: '💻' },
  { id: 'retail', name: 'Commerce & Distribution', icon: '🏪' },
  { id: 'health', name: 'Santé & Bien-être', icon: '⚕️' },
  { id: 'education', name: 'Éducation & Formation', icon: '📚' },
  { id: 'food', name: 'Restauration & Food', icon: '🍽️' },
  { id: 'creative', name: 'Créatif & Design', icon: '🎨' },
  { id: 'construction', name: 'Construction & BTP', icon: '🏗️' },
  { id: 'other', name: 'Autre secteur', icon: '🌟' }
]

const experiences = [
  { id: '0-2', label: 'Débutant (0-2 ans)', icon: '🌱' },
  { id: '2-5', label: 'Confirmé (2-5 ans)', icon: '🌿' },
  { id: '5-10', label: 'Expert (5-10 ans)', icon: '🌳' },
  { id: '10+', label: 'Vétéran (10+ ans)', icon: '🎓' }
]

const webPresence = [
  { id: 'website', label: 'Site web' },
  { id: 'social', label: 'Réseaux sociaux' },
  { id: 'marketplace', label: 'Places de marché' },
  { id: 'blog', label: 'Blog' },
  { id: 'app', label: 'Application mobile' }
]

export default function StepProfessional({ data, onComplete }: StepProfessionalProps) {
  const [formData, setFormData] = useState({
    sector: data.sector || '',
    experience: data.experience || '',
    webPresence: data.webPresence || []
  })

  const handleSectorSelect = (sectorId: string) => {
    setFormData({ ...formData, sector: sectorId })
  }

  const handleExperienceSelect = (expId: string) => {
    setFormData({ ...formData, experience: expId })
  }

  const handleWebPresenceToggle = (id: string) => {
    const current = formData.webPresence
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id]
    setFormData({ ...formData, webPresence: updated })
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
          <Label className="text-lg mb-4 block">Ton secteur d'activité</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <Card
                key={sector.id}
                className={`cursor-pointer transition-all ${
                  formData.sector === sector.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleSectorSelect(sector.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{sector.icon}</div>
                  <div className="text-sm font-medium">{sector.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg mb-4 block">Ton expérience</Label>
          <div className="grid grid-cols-2 gap-4">
            {experiences.map((exp) => (
              <Card
                key={exp.id}
                className={`cursor-pointer transition-all ${
                  formData.experience === exp.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleExperienceSelect(exp.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-2xl">{exp.icon}</div>
                  <div className="text-sm font-medium">{exp.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg mb-4 block">Ta présence en ligne</Label>
          <div className="space-y-3">
            {webPresence.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={formData.webPresence.includes(item.id)}
                  onCheckedChange={() => handleWebPresenceToggle(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
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