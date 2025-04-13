"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { OnboardingData, Badge, StepProps } from '../types';

export default function StepGrowth({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState({
    growthGoals: data.growthGoals || [],
    marketingBudget: data.marketingBudget || 0,
    timelineMonths: data.timelineMonths || 6
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      ...data,
      growthGoals: formData.growthGoals,
      marketingBudget: formData.marketingBudget,
      timelineMonths: formData.timelineMonths
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
          <Label>Marketing Budget (Monthly)</Label>
          <div className="space-y-2">
            <Slider
              value={[formData.marketingBudget]}
              onValueChange={(value) => setFormData({ ...formData, marketingBudget: value[0] })}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.marketingBudget}€ / month
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Growth Timeline</Label>
          <div className="space-y-2">
            <Slider
              value={[formData.timelineMonths]}
              onValueChange={(value) => setFormData({ ...formData, timelineMonths: value[0] })}
              min={3}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.timelineMonths} months
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </motion.div>
  )
} 