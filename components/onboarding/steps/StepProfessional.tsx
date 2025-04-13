"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingData, Badge, StepProps } from '../types'
import {
  CardContent,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Sector {
  id: string
  name: string
}

interface Experience {
  id: string
  label: string
  icon: string
}

interface WebPresenceItem {
  id: string
  label: string
}

interface Option {
  id: string
  name: string
}

interface FormData {
  sector: string
  experience: string
  webPresence: string[]
}

const sectors: Sector[] = [
  { id: 'technology', name: 'Technology' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'education', name: 'Education' },
  { id: 'finance', name: 'Finance' },
  { id: 'retail', name: 'Retail' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'services', name: 'Services' },
  { id: 'other', name: 'Other' }
]

const experiences: Experience[] = [
  { id: '0-2', label: 'Débutant (0-2 ans)', icon: '🌱' },
  { id: '2-5', label: 'Confirmé (2-5 ans)', icon: '🌿' },
  { id: '5-10', label: 'Expert (5-10 ans)', icon: '🌳' },
  { id: '10+', label: 'Vétéran (10+ ans)', icon: '🎓' }
]

const webPresence: WebPresenceItem[] = [
  { id: 'website', label: 'Site web' },
  { id: 'social', label: 'Réseaux sociaux' },
  { id: 'marketplace', label: 'Places de marché' },
  { id: 'blog', label: 'Blog' },
  { id: 'app', label: 'Application mobile' }
]

const companySizes: Option[] = [
  { id: 'solo', name: 'Solo' },
  { id: '2-10', name: '2-10' },
  { id: '11-50', name: '11-50' },
  { id: '51-200', name: '51-200' },
  { id: '201-1000', name: '201-1000' },
  { id: '1000+', name: '1000+' }
]

const projectTypes: Option[] = [
  { id: 'startup', name: 'Startup' },
  { id: 'small-business', name: 'Small Business' },
  { id: 'enterprise', name: 'Enterprise' },
  { id: 'agency', name: 'Agency' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'other', name: 'Other' }
]

export default function StepProfessional({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState({
    role: data.role || '',
    sector: data.sector || '',
    companySize: data.companySize || '',
    projectType: data.projectType || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      ...data,
      ...formData
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label>Your Role</Label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. CEO, Developer, Designer"
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Industry Sector</Label>
          <Select
            value={formData.sector}
            onValueChange={(value) => setFormData({ ...formData, sector: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Company Size</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => setFormData({ ...formData, companySize: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Project Types</Label>
          <Select
            value={formData.projectType[0] || ''}
            onValueChange={(value) => setFormData({ ...formData, projectType: [value] })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </motion.div>
  )
} 