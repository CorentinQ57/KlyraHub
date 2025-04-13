"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingData, Badge, StepProps } from '../types'

const sectors = [
  { id: "tech", label: "Technologie" },
  { id: "retail", label: "Commerce" },
  { id: "health", label: "Santé" },
  { id: "education", label: "Éducation" },
  { id: "finance", label: "Finance" },
  { id: "other", label: "Autre" }
]

const companySizes = [
  { id: "1-10", label: "1-10 employés" },
  { id: "11-50", label: "11-50 employés" },
  { id: "51-200", label: "51-200 employés" },
  { id: "201-500", label: "201-500 employés" },
  { id: "500+", label: "Plus de 500 employés" }
]

const projectTypes = [
  { id: "website", label: "Site web" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "webapp", label: "Application web" },
  { id: "branding", label: "Branding" },
  { id: "marketing", label: "Marketing digital" },
  { id: "consulting", label: "Consulting" }
]

export default function StepIntroduction({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    businessName: data.businessName || '',
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

  const isValid = formData.name && formData.businessName && formData.role

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold"
        >
          Welcome to KlyraHub!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mt-2"
        >
          Let's start by getting to know you and your business better.
        </motion.p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Your Business Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="CEO, Founder, Manager..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Business Sector</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="Technology, Retail, Healthcare..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Input
              id="companySize"
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              placeholder="1-10, 11-50, 51-200..."
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!isValid}>
            Continue
          </Button>
        </form>
      </Card>
    </motion.div>
  )
} 