"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Users, Rocket } from 'lucide-react'

interface StepIntroductionProps {
  data: {
    sector?: string
    companySize?: string
    projectType?: string[]
  }
  setData: (data: any) => void
}

const sectors = [
  { value: 'tech', label: 'Tech & SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'service', label: 'Service B2B' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Autre' }
]

const companySizes = [
  { value: 'solo', label: 'Solo entrepreneur', icon: <Rocket className="w-4 h-4" /> },
  { value: 'small', label: '2-10 employés', icon: <Users className="w-4 h-4" /> },
  { value: 'medium', label: '11-50 employés', icon: <Building2 className="w-4 h-4" /> },
  { value: 'large', label: '50+ employés', icon: <Building2 className="w-4 h-4" /> }
]

const projectTypes = [
  { id: 'branding', label: 'Branding & Identité visuelle' },
  { id: 'website', label: 'Site web & Landing page' },
  { id: 'webapp', label: 'Application web' },
  { id: 'marketing', label: 'Marketing digital' },
  { id: 'consulting', label: 'Consulting & Stratégie' }
]

export default function StepIntroduction({ data, setData }: StepIntroductionProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>(data.projectType || [])

  const handleProjectTypeChange = (checked: boolean, value: string) => {
    setSelectedProjects(prev => {
      if (checked) {
        return [...prev, value]
      } else {
        return prev.filter(item => item !== value)
      }
    })
    setData({ ...data, projectType: selectedProjects })
  }

  return (
    <div className="space-y-8">
      {/* Message de bienvenue animé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Bienvenue dans l'aventure Klyra !
        </h2>
        <p className="text-muted-foreground">
          Nous sommes ravis de vous accompagner dans votre transformation digitale.
          Commençons par mieux vous connaître !
        </p>
      </motion.div>

      {/* Secteur d'activité */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <Label htmlFor="sector" className="text-lg font-medium">
          Dans quel secteur évoluez-vous ?
        </Label>
        <Select
          value={data.sector}
          onValueChange={(value) => setData({ ...data, sector: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisissez votre secteur" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector.value} value={sector.value}>
                {sector.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Taille de l'entreprise */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quelle est la taille de votre entreprise ?
        </Label>
        <RadioGroup
          value={data.companySize}
          onValueChange={(value) => setData({ ...data, companySize: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {companySizes.map((size) => (
            <Label
              key={size.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.companySize === size.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={size.value} id={size.value} />
              <div className="flex items-center space-x-2">
                {size.icon}
                <span>{size.label}</span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Types de projets */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quels types de projets vous intéressent ? (plusieurs choix possibles)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectTypes.map((project) => (
            <Label
              key={project.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedProjects.includes(project.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={(checked) => handleProjectTypeChange(checked as boolean, project.id)}
                id={project.id}
              />
              <span>{project.label}</span>
            </Label>
          ))}
        </div>
      </motion.div>

      {/* Message d'encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-8"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            Super ! Ces informations nous permettront de personnaliser votre expérience
            et de vous proposer les solutions les plus adaptées à vos besoins.
          </p>
        </Card>
      </motion.div>
    </div>
  )
} 