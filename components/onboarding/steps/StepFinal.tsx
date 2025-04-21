'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface StepFinalProps {
  data: {
    fullName?: string
    sectors?: string[]
    companySize?: string
    needs?: string[]
    visualPreferences?: string[]
    communicationStyle?: string
    timeManagement?: string
  }
  onComplete: (data: any) => void
}

const getSectorName = (id: string) => {
  const sectors = {
    'tech': 'Technologie',
    'finance': 'Finance',
    'healthcare': 'Santé',
    'education': 'Éducation',
    'retail': 'Commerce',
    'manufacturing': 'Industrie',
  };
  return sectors[id as keyof typeof sectors] || id;
};

const getCompanySizeName = (id: string) => {
  const sizes = {
    'solo': 'Entrepreneur individuel',
    'small': 'Petite entreprise (2-10)',
    'medium': 'Moyenne entreprise (11-50)',
    'large': 'Grande entreprise (51+)',
  };
  return sizes[id as keyof typeof sizes] || id;
};

const getNeedName = (id: string) => {
  const needs = {
    'branding': 'Identité de marque',
    'website': 'Site web',
    'marketing': 'Marketing numérique',
    'ui-ux': 'UI/UX Design',
    'social': 'Réseaux sociaux',
    'content': 'Création de contenu',
  };
  return needs[id as keyof typeof needs] || id;
};

const getStyleName = (id: string) => {
  const styles = {
    'minimal': 'Minimaliste',
    'bold': 'Audacieux',
    'classic': 'Classique',
    'playful': 'Ludique',
  };
  return styles[id as keyof typeof styles] || id;
};

const getCommunicationStyleName = (id: string) => {
  const styles = {
    'direct': 'Direct et concis',
    'detailed': 'Détaillé et explicatif',
    'casual': 'Décontracté et amical',
    'formal': 'Formel et professionnel',
  };
  return styles[id as keyof typeof styles] || id;
};

const getTimeManagementName = (id: string) => {
  const styles = {
    'flexible': 'Flexible et adaptable',
    'structured': 'Structuré et planifié',
    'deadline': 'Focalisé sur les deadlines',
    'proactive': 'Proactif et anticipatif',
  };
  return styles[id as keyof typeof styles] || id;
};

export default function StepFinal({ data, onComplete }: StepFinalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Récapitulatif de ton profil</h2>
        <p className="text-gray-600">Vérifie les informations ci-dessous avant de finaliser ton profil</p>
      </motion.div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Informations personnelles</h3>
            <p><span className="text-gray-500">Nom :</span> {data.fullName || 'Non spécifié'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Informations professionnelles</h3>
            <div className="space-y-2">
              {data.sectors && data.sectors.length > 0 && (
                <p><span className="text-gray-500">Secteurs d'activité :</span> {data.sectors.map(getSectorName).join(', ')}</p>
              )}
              {data.companySize && (
                <p><span className="text-gray-500">Taille de l'entreprise :</span> {getCompanySizeName(data.companySize)}</p>
              )}
              {data.needs && data.needs.length > 0 && (
                <p><span className="text-gray-500">Besoins actuels :</span> {data.needs.map(getNeedName).join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Préférences</h3>
            <div className="space-y-2">
              {data.visualPreferences && data.visualPreferences.length > 0 && (
                <p><span className="text-gray-500">Style visuel :</span> {data.visualPreferences.map(getStyleName).join(', ')}</p>
              )}
              {data.communicationStyle && (
                <p><span className="text-gray-500">Communication :</span> {getCommunicationStyleName(data.communicationStyle)}</p>
              )}
              {data.timeManagement && (
                <p><span className="text-gray-500">Relation avec les délais :</span> {getTimeManagementName(data.timeManagement)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={() => onComplete(data)}
          className="w-full"
          size="lg"
        >
          Terminer et accéder à mon tableau de bord 🚀
        </Button>
      </motion.div>
    </motion.div>
  );
} 