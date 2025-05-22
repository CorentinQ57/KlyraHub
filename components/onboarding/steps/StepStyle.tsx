'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Circle,
  Palette,
  Star,
  Gamepad,
  MessageSquare,
  BookOpen,
  Coffee,
  Briefcase,
  Clock,
  Calendar,
  Flag,
  Zap
} from 'lucide-react';
import CardSelector from '@/components/onboarding/CardSelector';

interface StepStyleProps {
  data: any
  onComplete: (data: any) => void
}

const visualStyles = [
  {
    id: 'minimal',
    name: 'Minimaliste',
    icon: <Circle className="h-6 w-6" />,
    description: 'Épuré, moderne, efficace',
  },
  {
    id: 'bold',
    name: 'Audacieux',
    icon: <Palette className="h-6 w-6" />,
    description: 'Coloré, expressif, unique',
  },
  {
    id: 'classic',
    name: 'Classique',
    icon: <Star className="h-6 w-6" />,
    description: 'Élégant, professionnel, intemporel',
  },
  {
    id: 'playful',
    name: 'Ludique',
    icon: <Gamepad className="h-6 w-6" />,
    description: 'Fun, dynamique, engageant',
  },
];

const communicationStyles = [
  { id: 'direct', label: 'Direct et concis', icon: <MessageSquare className="h-6 w-6" />, description: 'Communication claire et directe' },
  { id: 'detailed', label: 'Détaillé et explicatif', icon: <BookOpen className="h-6 w-6" />, description: 'Informations détaillées et explications' },
  { id: 'casual', label: 'Décontracté et amical', icon: <Coffee className="h-6 w-6" />, description: 'Style convivial et informel' },
  { id: 'formal', label: 'Formel et professionnel', icon: <Briefcase className="h-6 w-6" />, description: 'Communication structurée et professionnelle' },
];

const timeManagementStyles = [
  { id: 'flexible', label: 'Flexible et adaptable', icon: <Clock className="h-6 w-6" />, description: 'Capable de s\'adapter aux changements' },
  { id: 'structured', label: 'Structuré et planifié', icon: <Calendar className="h-6 w-6" />, description: 'Organisation et planification en amont' },
  { id: 'deadline', label: 'Focalisé sur les deadlines', icon: <Flag className="h-6 w-6" />, description: 'Respect des échéances avant tout' },
  { id: 'proactive', label: 'Proactif et anticipatif', icon: <Zap className="h-6 w-6" />, description: 'Anticipe les besoins et agit en avance' },
];

export default function StepStyle({ data, onComplete }: StepStyleProps) {
  const [formData, setFormData] = useState({
    visualPreferences: data.visualPreferences || [],
    communicationStyle: data.communicationStyle || '',
    timeManagement: data.timeManagement || '',
  });

  const toggleVisualStyle = (styleId: string) => {
    const current = formData.visualPreferences as string[];
    const updated = current.includes(styleId)
      ? current.filter(id => id !== styleId)
      : [...current, styleId];
    
    // Limit to max 2 selections
    if (updated.length <= 2) {
      setFormData({ ...formData, visualPreferences: updated });
    }
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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label className="text-lg mb-4 block">
            Ton style visuel préféré (choisis-en 1 ou 2)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {visualStyles.map((style) => (
              <CardSelector
                key={style.id}
                id={style.id}
                title={style.name}
                description={style.description}
                icon={style.icon}
                isSelected={(formData.visualPreferences as string[]).includes(style.id)}
                onClick={() => toggleVisualStyle(style.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-lg mb-4 block">
              Ton style de communication préféré
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {communicationStyles.map((style) => (
                <CardSelector
                  key={style.id}
                  id={style.id}
                  title={style.label}
                  description={style.description}
                  icon={style.icon}
                  isSelected={formData.communicationStyle === style.id}
                  onClick={() => setFormData({ ...formData, communicationStyle: style.id })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-lg mb-4 block">
              Ta relation avec les délais
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {timeManagementStyles.map((style) => (
                <CardSelector
                  key={style.id}
                  id={style.id}
                  title={style.label}
                  description={style.description}
                  icon={style.icon}
                  isSelected={formData.timeManagement === style.id}
                  onClick={() => setFormData({ ...formData, timeManagement: style.id })}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          Parfait !
        </Button>
      </form>
    </motion.div>
  );
} 