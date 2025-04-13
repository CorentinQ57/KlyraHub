import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OnboardingData } from '../OnboardingFlow'

interface StepTeamProps {
  data: OnboardingData
  setData: (data: OnboardingData) => void
}

const teamSizes = [
  { value: 'solo', label: 'Solo', description: 'Je travaille seul' },
  { value: 'small', label: 'Petite équipe', description: '2-5 personnes' },
  { value: 'medium', label: 'Équipe moyenne', description: '6-15 personnes' },
  { value: 'large', label: 'Grande équipe', description: '15+ personnes' }
]

const collaborationStyles = [
  { id: 'agile', label: 'Méthodes agiles' },
  { id: 'remote', label: 'Travail à distance' },
  { id: 'async', label: 'Communication asynchrone' },
  { id: 'structured', label: 'Processus structurés' },
  { id: 'flexible', label: 'Flexibilité horaire' },
  { id: 'regular', label: 'Points réguliers' }
]

export default function StepTeam({ data, setData }: StepTeamProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    data.collaborationStyles || []
  )

  const handleStyleChange = (checked: boolean, value: string) => {
    setSelectedStyles((prev) => {
      const newStyles = checked
        ? [...prev, value]
        : prev.filter((item) => item !== value)
      setData({ ...data, collaborationStyles: newStyles })
      return newStyles
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold"
        >
          Votre Équipe
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-muted-foreground"
        >
          Parlez-nous de votre équipe et de vos préférences de collaboration
        </motion.p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Quelle est la taille de votre équipe ?
          </Label>
          <RadioGroup
            value={data.teamSize}
            onValueChange={(value) => setData({ ...data, teamSize: value })}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {teamSizes.map((size) => (
              <Label
                key={size.value}
                className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.teamSize === size.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <RadioGroupItem
                  value={size.value}
                  id={size.value}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-medium">{size.label}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {size.description}
                </p>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-medium">
            Quels sont vos styles de collaboration préférés ?
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborationStyles.map((style) => (
              <Label
                key={style.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStyles.includes(style.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={selectedStyles.includes(style.id)}
                  onCheckedChange={(checked) =>
                    handleStyleChange(checked as boolean, style.id)
                  }
                  id={style.id}
                />
                <span>{style.label}</span>
              </Label>
            ))}
          </div>
        </div>
      </Card>

      <Button
        onClick={() => setData({ ...data, collaborationStyles: selectedStyles })}
        className="w-full"
      >
        Continuer
      </Button>
    </motion.div>
  )
} 