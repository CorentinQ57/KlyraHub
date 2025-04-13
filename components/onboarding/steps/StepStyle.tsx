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

export default function StepStyle({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState({
    communication: data.style?.communication || '',
    timeManagement: data.style?.timeManagement || '',
    visualPreference: data.style?.visualPreference || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      ...data,
      style: formData
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
          <Label>Communication Style</Label>
          <RadioGroup
            value={formData.communication}
            onValueChange={(value) => setFormData({ ...formData, communication: value })}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Label
              htmlFor="formal"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="formal" id="formal" className="sr-only" />
              <MessageSquare className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Formal</h3>
                <p className="text-sm text-muted-foreground">Professional and structured communication</p>
              </div>
            </Label>
            <Label
              htmlFor="casual"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="casual" id="casual" className="sr-only" />
              <Heart className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Casual</h3>
                <p className="text-sm text-muted-foreground">Friendly and relaxed communication</p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>Time Management Approach</Label>
          <RadioGroup
            value={formData.timeManagement}
            onValueChange={(value) => setFormData({ ...formData, timeManagement: value })}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Label
              htmlFor="structured"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="structured" id="structured" className="sr-only" />
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Structured</h3>
                <p className="text-sm text-muted-foreground">Fixed schedules and deadlines</p>
              </div>
            </Label>
            <Label
              htmlFor="flexible"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="flexible" id="flexible" className="sr-only" />
              <Palette className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Flexible</h3>
                <p className="text-sm text-muted-foreground">Adaptable to changing priorities</p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>Visual Preference</Label>
          <RadioGroup
            value={formData.visualPreference}
            onValueChange={(value) => setFormData({ ...formData, visualPreference: value })}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Label
              htmlFor="minimal"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="minimal" id="minimal" className="sr-only" />
              <Palette className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Minimal</h3>
                <p className="text-sm text-muted-foreground">Clean and simple design</p>
              </div>
            </Label>
            <Label
              htmlFor="expressive"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="expressive" id="expressive" className="sr-only" />
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="space-y-1">
                <h3 className="font-semibold">Expressive</h3>
                <p className="text-sm text-muted-foreground">Bold and creative design</p>
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