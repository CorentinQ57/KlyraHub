"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StepFinalProps {
  data: any
  onComplete: (data: any) => void
  badges: string[]
}

const socialNetworks = [
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { id: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/...' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' }
]

export default function StepFinal({ data, onComplete, badges }: StepFinalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    avatarUrl: data.avatarUrl || '',
    socialLinks: data.socialLinks || {},
    funFact: data.funFact || ''
  })
  const [previewUrl, setPreviewUrl] = useState(data.avatarUrl || '')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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

  const handleSocialChange = (networkId: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [networkId]: value }
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
        <div className="text-center">
          <Label className="text-lg mb-4 block">Ta photo de profil</Label>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage src={previewUrl} />
              <AvatarFallback>
                {data.fullName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choisir une photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-lg block">Tes réseaux sociaux</Label>
          {socialNetworks.map((network) => (
            <div key={network.id}>
              <Label htmlFor={network.id}>{network.label}</Label>
              <Input
                id={network.id}
                placeholder={network.placeholder}
                value={formData.socialLinks[network.id] || ''}
                onChange={(e) => handleSocialChange(network.id, e.target.value)}
                className="mt-2"
              />
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="funFact" className="text-lg block">
            Un fait amusant sur toi ou ton entreprise 😊
          </Label>
          <Textarea
            id="funFact"
            placeholder="Partage quelque chose d'unique..."
            value={formData.funFact}
            onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
            className="mt-2"
          />
        </div>

        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="font-medium mb-2">Tes badges gagnés 🏆</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Terminer 🎉
        </Button>
      </form>
    </motion.div>
  )
} 