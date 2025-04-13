"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Upload, Linkedin, Twitter, Instagram, Globe, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingData, Badge, StepProps } from '../types'

interface SocialLinks {
  linkedin?: string
  twitter?: string
  instagram?: string
}

interface ExtendedOnboardingData extends OnboardingData {
  avatarUrl?: string
  companyBio?: string
  socialLinks?: SocialLinks
  timezone?: string
  availability?: string[]
}

const timezones = [
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Europe/London', label: 'Londres (UTC)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Singapore', label: 'Singapour (UTC+8)' }
]

const availabilitySlots = [
  { value: 'morning', label: 'Matin (9h-12h)' },
  { value: 'afternoon', label: 'Après-midi (14h-17h)' },
  { value: 'evening', label: 'Soir (17h-19h)' }
]

export default function StepFinal({ data, onComplete, badges }: StepProps) {
  const [formData, setFormData] = useState<ExtendedOnboardingData>({
    ...data,
    avatarUrl: (data as ExtendedOnboardingData).avatarUrl || '',
    companyBio: (data as ExtendedOnboardingData).companyBio || '',
    socialLinks: (data as ExtendedOnboardingData).socialLinks || {},
    timezone: (data as ExtendedOnboardingData).timezone || '',
    availability: (data as ExtendedOnboardingData).availability || []
  })
  const [previewUrl, setPreviewUrl] = useState<string>((data as ExtendedOnboardingData).avatarUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedSlots, setSelectedSlots] = useState<string[]>((data as ExtendedOnboardingData).availability || [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewUrl(result)
        setFormData({ ...formData, avatarUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSocialLinkChange = (network: keyof SocialLinks, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...(formData.socialLinks || {}),
        [network]: value
      }
    })
  }

  const handleAvailabilityChange = (slot: string) => {
    const newSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter(s => s !== slot)
      : [...selectedSlots, slot]
    setSelectedSlots(newSlots)
    setFormData({ ...formData, availability: newSlots })
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  return (
    <div className="space-y-8">
      {/* Avatar et Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-muted">
              <AvatarImage src={previewUrl} />
              <AvatarFallback>
                <Upload className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <Label className="text-lg font-medium mb-2 block">
              Bio de l'entreprise
            </Label>
            <Textarea
              value={formData.companyBio || ''}
              onChange={(e) => setFormData({ ...formData, companyBio: e.target.value })}
              placeholder="Décrivez votre entreprise en quelques phrases..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </motion.div>

      {/* Réseaux sociaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Vos réseaux sociaux
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              value={formData.socialLinks?.linkedin || ''}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Label>
            <Input
              value={formData.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              value={formData.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </motion.div>

      {/* Timezone et Disponibilités */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Votre fuseau horaire
          </Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre fuseau horaire" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Vos disponibilités habituelles
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availabilitySlots.map((slot) => (
              <Button
                key={slot.value}
                variant={selectedSlots.includes(slot.value) ? "default" : "outline"}
                onClick={() => handleAvailabilityChange(slot.value)}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                {slot.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="w-full md:w-auto">
          Terminer
        </Button>
      </div>
    </div>
  )
} 