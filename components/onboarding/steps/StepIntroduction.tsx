"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StepIntroductionProps {
  data: any
  onComplete: (data: any) => void
}

const teamSizes = [
  { value: "1", label: "Solo" },
  { value: "2-5", label: "Petite équipe (2-5)" },
  { value: "6-15", label: "Équipe moyenne (6-15)" },
  { value: "16-50", label: "Grande équipe (16-50)" },
  { value: "50+", label: "Très grande équipe (50+)" }
]

export default function StepIntroduction({ data, onComplete }: StepIntroductionProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    company: data.company || '',
    teamSize: data.teamSize || ''
  })

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
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            👋
          </motion.div>
          <p className="text-lg text-muted-foreground">
            Super content de te rencontrer ! On va faire ça tranquillement, étape par étape.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Comment tu t'appelles ?</Label>
              <Input
                id="fullName"
                placeholder="Ton nom complet"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Ton entreprise</Label>
              <Input
                id="company"
                placeholder="Le nom de ton entreprise"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="teamSize">Taille de ton équipe</Label>
              <Select
                value={formData.teamSize}
                onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionne la taille de ton équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
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
            C'est parti ! 🚀
          </Button>
        </form>
      </div>
    </motion.div>
  )
} 