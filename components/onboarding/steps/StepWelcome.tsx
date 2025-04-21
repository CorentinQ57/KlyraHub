'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building, Mail, Phone } from 'lucide-react';

interface StepWelcomeProps {
  data: any
  onComplete: (data: any) => void
}

export default function StepWelcome({ data, onComplete }: StepWelcomeProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    companyName: data.companyName || '',
    email: data.email || '',
    phone: data.phone || '',
    goals: data.goals || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">👋 Bienvenue sur Klyra Hub !</h2>
          <p className="text-[#64748B]">
            Nous sommes ravis de vous accueillir. Prenons quelques minutes pour personnaliser votre expérience et mieux comprendre vos besoins.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[14px] font-medium">
              Nom complet
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <User size={16} />
              </div>
              <Input
                id="fullName"
                placeholder="Votre nom"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[14px] font-medium">
              Entreprise
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Building size={16} />
              </div>
              <Input
                id="companyName"
                placeholder="Nom de votre entreprise"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[14px] font-medium">
              Email professionnel
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Mail size={16} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[14px] font-medium">
              Téléphone
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Phone size={16} />
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="Votre numéro de téléphone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals" className="text-[14px] font-medium">
            Vos objectifs avec Klyra
          </Label>
          <Textarea
            id="goals"
            placeholder="Partagez brièvement vos objectifs et attentes..."
            value={formData.goals}
            onChange={(e) => handleChange('goals', e.target.value)}
            rows={4}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
        >
          Commençons l'aventure ! 🚀
        </Button>
      </form>
    </motion.div>
  );
} 