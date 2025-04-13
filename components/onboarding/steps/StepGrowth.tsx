import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { OnboardingData } from '../OnboardingFlow';

interface StepGrowthProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
}

const growthObjectives = [
  'Augmenter le chiffre d\'affaires',
  'Optimiser les couts',
  'Developper de nouveaux marches',
  'Ameliorer la satisfaction client',
  'Innover sur les produits/services',
  'Renforcer l\'image de marque',
];

const timelineOptions = [
  '3 mois',
  '6 mois',
  '1 an',
  '2 ans',
  '5 ans',
];

export default function StepGrowth({ data, onComplete }: StepGrowthProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(data.growthObjectives || []);
  const [timeline, setTimeline] = useState<string>(data.timeline || '1 an');
  const [budget, setBudget] = useState<string>(data.budget || '');

  const handleObjectiveToggle = (objective: string) => {
    setSelectedObjectives(prev => 
      prev.includes(objective)
        ? prev.filter(o => o !== objective)
        : [...prev, objective]
    );
  };

  const handleSubmit = () => {
    onComplete({
      growthObjectives: selectedObjectives,
      timeline,
      budget,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold"
        >
          Objectifs de croissance
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-gray-600"
        >
          Selectionnez vos principaux objectifs de croissance et definissez votre timeline
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {growthObjectives.map((objective, index) => (
          <motion.div
            key={objective}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedObjectives.includes(objective)
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleObjectiveToggle(objective)}
            >
              {objective}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6 mt-8">
        <div className="space-y-4">
          <Label>Timeline</Label>
          <div className="flex gap-2">
            {timelineOptions.map((option) => (
              <Button
                key={option}
                variant={timeline === option ? 'default' : 'outline'}
                onClick={() => setTimeline(option)}
                className="flex-1"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Budget mensuel estime (€)</Label>
          <Input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ex: 5000"
            className="w-full"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-8"
        disabled={selectedObjectives.length === 0 || !timeline || !budget}
      >
        Continuer
      </Button>
    </motion.div>
  );
} 