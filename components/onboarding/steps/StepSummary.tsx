"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface StepSummaryProps {
  data: any
  onComplete: (data: any) => void
}

interface SuggestedService {
  id: string
  name: string
  description: string
  icon: string
}

export default function StepSummary({ data, onComplete }: StepSummaryProps) {
  // Define suggested services based on needs
  const suggestedServices: SuggestedService[] = []
  
  if (data.needsBranding) {
    suggestedServices.push({
      id: 'branding-pack',
      name: 'Pack Identité de marque',
      description: 'Logo, charte graphique et guide de style complet.',
      icon: '🎨'
    })
  }
  
  if (data.needsWebsite) {
    suggestedServices.push({
      id: 'website-pack',
      name: 'Site Web Professionnel',
      description: 'Site responsive avec design personnalisé et optimisé SEO.',
      icon: '🌐'
    })
  }
  
  if (data.needsMarketing) {
    suggestedServices.push({
      id: 'marketing-pack',
      name: 'Stratégie Marketing Digital',
      description: 'Plan marketing complet et supports pour réseaux sociaux.',
      icon: '📣'
    })
  }
  
  // If no specific needs were selected, suggest a starter pack
  if (suggestedServices.length === 0) {
    suggestedServices.push({
      id: 'starter-pack',
      name: 'Pack Démarrage',
      description: 'L\'essentiel pour lancer votre présence en ligne.',
      icon: '🚀'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">🎉 Récapitulatif de votre profil</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-medium mb-2">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[14px]">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Nom :</span>
                    <span className="font-medium ml-1">{data.fullName || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Entreprise :</span>
                    <span className="font-medium ml-1">{data.companyName || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Email :</span>
                    <span className="font-medium ml-1">{data.email || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Téléphone :</span>
                    <span className="font-medium ml-1">{data.phone || 'Non spécifié'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-[16px] font-medium mb-2">Profil business</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-[14px]">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Secteur :</span>
                    <span className="font-medium ml-1">
                      {sectors.find(s => s.id === data.sector)?.name || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-[#64748B]">Taille d'équipe :</span>
                    <span className="font-medium ml-1">
                      {companySizes.find(s => s.id === data.companySize)?.name || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-[16px] font-medium mb-2">Besoins et préférences</h3>
                <div className="grid grid-cols-1 gap-y-1 text-[14px]">
                  {data.needsBranding && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Besoin en Branding et Identité</span>
                    </div>
                  )}
                  {data.needsWebsite && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Besoin d'un site web</span>
                    </div>
                  )}
                  {data.needsMarketing && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Besoin en Marketing Digital</span>
                    </div>
                  )}
                  {data.visualPreferences?.length > 0 && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Style visuel : 
                        <span className="font-medium ml-1">
                          {data.visualPreferences.map((vp: string) => 
                            visualStyles.find(vs => vs.id === vp)?.name
                          ).join(', ')}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Services recommandés pour vous</h2>
          <div className="space-y-3">
            {suggestedServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mr-4 text-2xl">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-[#64748B]">{service.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#64748B]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Link href="/dashboard">
            <Button variant="outline">
              Je compléterai plus tard
            </Button>
          </Link>
          <Button
            type="submit"
          >
            Terminer et voir les services 🚀
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

// Business sectors (copy from StepProfile for data display)
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

// Company sizes (copy from StepProfile for data display)
const companySizes = [
  { id: 'solo', name: 'Indépendant' },
  { id: 'small', name: 'Petite équipe' },
  { id: 'medium', name: 'PME' },
  { id: 'large', name: 'Grande entreprise' }
]

// Visual styles (copy from StepStyle for data display)
const visualStyles = [
  { id: 'minimal', name: 'Minimaliste' },
  { id: 'bold', name: 'Audacieux' },
  { id: 'classic', name: 'Classique' },
  { id: 'playful', name: 'Ludique' }
] 