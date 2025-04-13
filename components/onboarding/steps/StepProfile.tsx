"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Briefcase, Users, BarChart3 } from 'lucide-react'
import CardSelector from '@/components/onboarding/CardSelector'

interface StepProfileProps {
  data: any
  onComplete: (data: any) => void
}

// Business sectors
const sectors = [
  { id: 'tech', name: 'Tech & Startup', icon: '💻' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'retail', name: 'Retail & E-commerce', icon: '🛍️' },
  { id: 'health', name: 'Santé', icon: '⚕️' },
  { id: 'education', name: 'Éducation', icon: '📚' },
  { id: 'manufacturing', name: 'Industrie', icon: '🏭' },
  { id: 'services', name: 'Services', icon: '🤝' },
  { id: 'other', name: 'Autre', icon: '🔍' }
]

// Company sizes
const companySizes = [
  { id: 'solo', name: 'Indépendant', icon: <Users className="h-6 w-6" />, description: 'Vous travaillez seul' },
  { id: 'small', name: 'Petite équipe', icon: <Users className="h-6 w-6" />, description: '2 à 10 employés' },
  { id: 'medium', name: 'PME', icon: <Briefcase className="h-6 w-6" />, description: '11 à 50 employés' },
  { id: 'large', name: 'Grande entreprise', icon: <BarChart3 className="h-6 w-6" />, description: '50+ employés' }
]

// Needs options
const needsOptions = [
  { id: 'needsBranding', name: 'Branding', icon: '🎨', description: 'Logo, identité visuelle' },
  { id: 'needsWebsite', name: 'Site Web', icon: '🌐', description: 'Landing page, site vitrine' },
  { id: 'needsMarketing', name: 'Marketing', icon: '📣', description: 'Stratégie, réseaux sociaux' }
]

export default function StepProfile({ data, onComplete }: StepProfileProps) {
  const [formData, setFormData] = useState({
    sector: data.sector || '',
    companySize: data.companySize || '',
    needsBranding: data.needsBranding || false,
    needsWebsite: data.needsWebsite || false,
    needsMarketing: data.needsMarketing || false
  })

  const selectSector = (sectorId: string) => {
    setFormData({
      ...formData,
      sector: sectorId
    })
  }

  const selectCompanySize = (sizeId: string) => {
    setFormData({
      ...formData,
      companySize: sizeId
    })
  }

  const toggleNeed = (need: string) => {
    setFormData({
      ...formData,
      [need]: !formData[need as keyof typeof formData]
    })
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
          <Label className="text-lg mb-4 block">Votre secteur d'activité</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sectors.map((sector) => (
              <CardSelector
                key={sector.id}
                id={sector.id}
                title={sector.name}
                icon={<span className="text-2xl">{sector.icon}</span>}
                isSelected={formData.sector === sector.id}
                onClick={() => selectSector(sector.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg mb-4 block">Taille de votre équipe</Label>
          <div className="grid grid-cols-2 gap-4">
            {companySizes.map((size) => (
              <CardSelector
                key={size.id}
                id={size.id}
                title={size.name}
                description={size.description}
                icon={<div className="p-3 rounded-full bg-primary/10 text-primary">{size.icon}</div>}
                isSelected={formData.companySize === size.id}
                onClick={() => selectCompanySize(size.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-lg mb-4 block">Vos besoins actuels</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsOptions.map((need) => (
              <CardSelector
                key={need.id}
                id={need.id}
                title={need.name}
                description={need.description}
                icon={<span className="text-2xl">{need.icon}</span>}
                isSelected={formData[need.id as keyof typeof formData] as boolean}
                onClick={() => toggleNeed(need.id)}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Parfait ! Continue 🚶‍♂️
        </Button>
      </form>
    </motion.div>
  )
} 