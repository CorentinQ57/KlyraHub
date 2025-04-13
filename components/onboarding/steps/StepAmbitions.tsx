"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { OnboardingData, Badge, StepProps } from '../types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'

interface Priority {
  id: string
  content: string
}

interface Skill {
  id: string
  label: string
  icon: string
}

interface StepAmbitionsProps {
  data: any
  onComplete: (data: any) => void
}

const businessPriorities: Priority[] = [
  { id: 'brand', content: 'Developper ma marque 🎯' },
  { id: 'clients', content: 'Attirer plus de clients 🤝' },
  { id: 'digital', content: 'Accelerer ma transformation digitale 🚀' },
  { id: 'experience', content: 'Ameliorer l\'experience client ⭐' },
  { id: 'innovation', content: 'Innover dans mon secteur 💡' }
]

const skills: Skill[] = [
  { id: 'design', label: 'Design & UX', icon: '🎨' },
  { id: 'marketing', label: 'Marketing Digital', icon: '📢' },
  { id: 'tech', label: 'Technologies', icon: '💻' },
  { id: 'business', label: 'Business & Stratégie', icon: '📊' }
]

interface FormData {
  priorities: string[]
  skills: Record<string, number>
}

export default function StepAmbitions({ data, onComplete }: StepAmbitionsProps) {
  const [formData, setFormData] = useState<FormData>({
    priorities: data.priorities || businessPriorities.map(p => p.id),
    skills: data.skills || Object.fromEntries(skills.map(s => [s.id, 1]))
  })

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(formData.priorities)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormData({ ...formData, priorities: items })
  }

  const handleSkillChange = (skillId: string, value: number[]) => {
    setFormData({
      ...formData,
      skills: { ...formData.skills, [skillId]: value[0] }
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
        <div>
          <Label className="text-lg mb-6 block">
            Classe tes priorités business (glisse & dépose)
          </Label>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="priorities">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {formData.priorities.map((priorityId: string, index: number) => {
                    const priority = businessPriorities.find(p => p.id === priorityId)
                    if (!priority) return null
                    
                    return (
                      <Draggable
                        key={priority.id}
                        draggableId={priority.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 rounded-lg border ${
                              snapshot.isDragging
                                ? 'bg-primary/5 border-primary'
                                : 'bg-background hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">
                                {index + 1}
                              </span>
                              <span>{priority.content}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div>
          <Label className="text-lg mb-6 block">
            Évalue tes compétences actuelles
          </Label>
          <div className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span>{skill.icon}</span>
                  <Label>{skill.label}</Label>
                </div>
                <Slider
                  value={[formData.skills[skill.id]]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => handleSkillChange(skill.id, value)}
                  className="py-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Débutant</span>
                  <span>Expert</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          C'est noté ! 📝
        </Button>
      </form>
    </motion.div>
  )
} 