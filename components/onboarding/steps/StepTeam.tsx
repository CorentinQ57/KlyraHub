import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Users, Calendar, MessageSquare, Clock } from 'lucide-react'

interface StepTeamProps {
  data: {
    teamSize?: string
    keyRoles?: string[]
    validationProcess?: string
    communicationFrequency?: string
  }
  setData: (data: any) => void
}

const teamSizes = [
  { value: 'small', label: '1-5 personnes', description: 'Équipe resserrée, communication directe' },
  { value: 'medium', label: '6-15 personnes', description: 'Équipe intermédiaire, processus flexibles' },
  { value: 'large', label: '16-30 personnes', description: 'Grande équipe, processus structurés' },
  { value: 'enterprise', label: '30+ personnes', description: 'Organisation complexe, multiples équipes' }
]

const roles = [
  { id: 'marketing', label: 'Marketing Manager' },
  { id: 'product', label: 'Product Owner' },
  { id: 'tech', label: 'Tech Lead' },
  { id: 'design', label: 'Designer' },
  { id: 'content', label: 'Content Manager' },
  { id: 'sales', label: 'Commercial' },
  { id: 'other', label: 'Autre' }
]

const validationProcesses = [
  {
    value: 'agile',
    label: 'Agile & Itératif',
    description: 'Validations régulières, ajustements fréquents',
    icon: <Clock className="w-4 h-4" />
  },
  {
    value: 'structured',
    label: 'Structuré & Planifié',
    description: 'Étapes définies, validations formelles',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    value: 'collaborative',
    label: 'Collaboratif & Flexible',
    description: 'Échanges continus, décisions collégiales',
    icon: <Users className="w-4 h-4" />
  },
  {
    value: 'autonomous',
    label: 'Autonome & Efficace',
    description: 'Validations rapides, focus sur les résultats',
    icon: <MessageSquare className="w-4 h-4" />
  }
]

const communicationFrequencies = [
  { value: 'daily', label: 'Quotidien', description: 'Points courts et réguliers' },
  { value: 'weekly', label: 'Hebdomadaire', description: 'Réunions de suivi détaillées' },
  { value: 'biweekly', label: 'Bi-mensuel', description: 'Points d\'étape et validation' },
  { value: 'asNeeded', label: 'À la demande', description: 'Communication flexible selon besoins' }
]

export default function StepTeam({ data, setData }: StepTeamProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(data.keyRoles || [])
  const [otherRole, setOtherRole] = useState('')

  const handleRoleChange = (checked: boolean, value: string) => {
    setSelectedRoles(prev => {
      const newRoles = checked
        ? [...prev, value]
        : prev.filter(role => role !== value)
      setData({ ...data, keyRoles: newRoles })
      return newRoles
    })
  }

  return (
    <div className="space-y-8">
      {/* Taille de l'équipe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quelle est la taille de l'équipe impliquée dans les projets ?
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
              <RadioGroupItem value={size.value} id={size.value} className="sr-only" />
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">{size.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{size.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Rôles clés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quels sont les rôles clés impliqués dans les projets ?
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Label
              key={role.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRoles.includes(role.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedRoles.includes(role.id)}
                onCheckedChange={(checked) => handleRoleChange(checked as boolean, role.id)}
                id={role.id}
              />
              <span>{role.label}</span>
            </Label>
          ))}
        </div>
        {selectedRoles.includes('other') && (
          <Input
            value={otherRole}
            onChange={(e) => {
              setOtherRole(e.target.value)
              setData({ ...data, otherRole: e.target.value })
            }}
            placeholder="Précisez le rôle..."
            className="mt-2"
          />
        )}
      </motion.div>

      {/* Processus de validation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quel processus de validation préférez-vous ?
        </Label>
        <RadioGroup
          value={data.validationProcess}
          onValueChange={(value) => setData({ ...data, validationProcess: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {validationProcesses.map((process) => (
            <Label
              key={process.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.validationProcess === process.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={process.value} id={process.value} className="sr-only" />
              <div className="flex items-center justify-between mb-2">
                {process.icon}
                <span className="font-medium">{process.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{process.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Fréquence de communication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg font-medium">
          Quelle fréquence de communication préférez-vous ?
        </Label>
        <RadioGroup
          value={data.communicationFrequency}
          onValueChange={(value) => setData({ ...data, communicationFrequency: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {communicationFrequencies.map((frequency) => (
            <Label
              key={frequency.value}
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.communicationFrequency === frequency.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={frequency.value} id={frequency.value} className="sr-only" />
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{frequency.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{frequency.description}</p>
            </Label>
          ))}
        </RadioGroup>
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
            Excellent ! Ces informations nous permettront d'adapter notre méthode de travail
            à votre équipe et vos préférences. Nous mettrons en place un processus de collaboration
            optimal pour la réussite de vos projets.
          </p>
        </Card>
      </motion.div>
    </div>
  )
} 