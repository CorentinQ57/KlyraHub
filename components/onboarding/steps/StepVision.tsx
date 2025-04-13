import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Target, TrendingUp, Clock, Coins } from 'lucide-react'

interface StepVisionProps {
  data: {
    growthObjectives?: string[]
    timeline?: string
    budget?: string
    challenges?: string[]
  }
  setData: (data: any) => void
}

const growthObjectives = [
  { id: 'brand', label: 'Renforcer l\'image de marque', icon: <Target className="w-4 h-4" /> },
  { id: 'acquisition', label: 'Augmenter l\'acquisition client', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'conversion', label: 'Améliorer la conversion', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'retention', label: 'Fidéliser les clients', icon: <Target className="w-4 h-4" /> }
]

const timelines = [
  { value: '3months', label: '3 mois', description: 'Résultats rapides' },
  { value: '6months', label: '6 mois', description: 'Moyen terme' },
  { value: '1year', label: '1 an', description: 'Vision long terme' }
]

const challenges = [
  { id: 'visibility', label: 'Manque de visibilité en ligne' },
  { id: 'competition', label: 'Forte concurrence sur le marché' },
  { id: 'resources', label: 'Ressources limitées en interne' },
  { id: 'identity', label: 'Identité de marque à renforcer' },
  { id: 'conversion', label: 'Taux de conversion à améliorer' },
  { id: 'tech', label: 'Besoins techniques complexes' }
]

const budgetRanges = [
  { value: 'small', label: '< 5k€', description: 'Budget starter' },
  { value: 'medium', label: '5k€ - 15k€', description: 'Budget growth' },
  { value: 'large', label: '15k€ - 30k€', description: 'Budget scale-up' },
  { value: 'enterprise', label: '> 30k€', description: 'Budget enterprise' }
]

export default function StepVision({ data, setData }: StepVisionProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(data.growthObjectives || [])
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(data.challenges || [])

  const handleObjectiveChange = (checked: boolean, value: string) => {
    setSelectedObjectives(prev => {
      const newObjectives = checked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
      setData({ ...data, growthObjectives: newObjectives })
      return newObjectives
    })
  }

  const handleChallengeChange = (checked: boolean, value: string) => {
    setSelectedChallenges(prev => {
      const newChallenges = checked
        ? [...prev, value]
        : prev.filter(item => item !== value)
      setData({ ...data, challenges: newChallenges })
      return newChallenges
    })
  }

  return (
    <div className="space-y-8">
      {/* Objectifs de croissance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quels sont vos objectifs de croissance prioritaires ?
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {growthObjectives.map((objective) => (
            <Label
              key={objective.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedObjectives.includes(objective.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedObjectives.includes(objective.id)}
                onCheckedChange={(checked) => handleObjectiveChange(checked as boolean, objective.id)}
                id={objective.id}
              />
              <div className="flex items-center space-x-2">
                {objective.icon}
                <span>{objective.label}</span>
              </div>
            </Label>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Sur quelle période souhaitez-vous atteindre ces objectifs ?
        </Label>
        <RadioGroup
          value={data.timeline}
          onValueChange={(value) => setData({ ...data, timeline: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {timelines.map((timeline) => (
            <Label
              key={timeline.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.timeline === timeline.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={timeline.value} id={timeline.value} className="sr-only" />
              <div className="flex items-center justify-between">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{timeline.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{timeline.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quel budget envisagez-vous pour vos projets ?
        </Label>
        <RadioGroup
          value={data.budget}
          onValueChange={(value) => setData({ ...data, budget: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {budgetRanges.map((budget) => (
            <Label
              key={budget.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.budget === budget.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={budget.value} id={budget.value} className="sr-only" />
              <div className="flex items-center justify-between">
                <Coins className="w-4 h-4" />
                <span className="font-medium">{budget.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{budget.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Défis actuels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quels sont vos principaux défis actuels ?
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Label
              key={challenge.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedChallenges.includes(challenge.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedChallenges.includes(challenge.id)}
                onCheckedChange={(checked) => handleChallengeChange(checked as boolean, challenge.id)}
                id={challenge.id}
              />
              <span>{challenge.label}</span>
            </Label>
          ))}
        </div>
      </motion.div>

      {/* Message de conseil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            Excellent ! Ces informations nous permettront de vous proposer un plan d'action
            parfaitement aligné avec vos objectifs et votre budget. Notre équipe saura
            vous accompagner dans le dépassement de vos défis actuels.
          </p>
        </Card>
      </motion.div>
    </div>
  )
} 