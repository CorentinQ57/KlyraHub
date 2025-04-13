"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingData, Badge, StepProps } from '../types'

export default function StepVision({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState({
    vision: data.vision || '',
    targetMarket: data.targetMarket || [],
    innovationLevel: data.innovationLevel || 'moderate'
  })

  const targetMarketOptions = [
    'B2B - Petites entreprises',
    'B2B - Moyennes entreprises',
    'B2B - Grandes entreprises',
    'B2C - Particuliers',
    'B2G - Secteur public'
  ]

  const handleTargetMarketChange = (market: string) => {
    setFormData(prev => ({
      ...prev,
      targetMarket: prev.targetMarket.includes(market)
        ? prev.targetMarket.filter((m: string) => m !== market)
        : [...prev.targetMarket, market]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      ...data,
      vision: formData.vision,
      targetMarket: formData.targetMarket,
      innovationLevel: formData.innovationLevel
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
          <Label>Vision d'entreprise</Label>
          <Input
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            placeholder="Décrivez votre vision à long terme..."
            className="h-24"
          />
        </div>

        <div className="space-y-4">
          <Label>Marché cible</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetMarketOptions.map((market) => (
              <div key={market} className="flex items-center space-x-2">
                <Checkbox
                  id={market}
                  checked={formData.targetMarket.includes(market)}
                  onCheckedChange={() => handleTargetMarketChange(market)}
                />
                <Label htmlFor={market} className="cursor-pointer">
                  {market}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Niveau d'innovation souhaité</Label>
          <RadioGroup
            value={formData.innovationLevel}
            onValueChange={(value) => setFormData({ ...formData, innovationLevel: value })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Label
              htmlFor="conservative"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="conservative" id="conservative" className="sr-only" />
              <div className="space-y-1">
                <h3 className="font-semibold">Conservateur</h3>
                <p className="text-sm text-muted-foreground">Approche éprouvée et stable</p>
              </div>
            </Label>
            <Label
              htmlFor="moderate"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="moderate" id="moderate" className="sr-only" />
              <div className="space-y-1">
                <h3 className="font-semibold">Modéré</h3>
                <p className="text-sm text-muted-foreground">Équilibre innovation et stabilité</p>
              </div>
            </Label>
            <Label
              htmlFor="disruptive"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="disruptive" id="disruptive" className="sr-only" />
              <div className="space-y-1">
                <h3 className="font-semibold">Disruptif</h3>
                <p className="text-sm text-muted-foreground">Innovation radicale</p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </motion.div>
  )
} 