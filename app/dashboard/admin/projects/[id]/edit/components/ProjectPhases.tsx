"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'
import { updateProjectPhase } from '@/lib/supabase'

type ProjectPhasesProps = {
  project: any
  onPhaseUpdated: () => void
}

export default function ProjectPhases({ project, onPhaseUpdated }: ProjectPhasesProps) {
  const [currentPhase, setCurrentPhase] = useState<string>(project.current_phase || '')
  const [isSaving, setIsSaving] = useState(false)
  const [phases, setPhases] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Définir les phases disponibles
    if (project.service?.phases && Array.isArray(project.service.phases)) {
      setPhases(project.service.phases)
    } else {
      // Phases par défaut
      setPhases(["Briefing", "Conception", "Développement", "Tests et validation", "Livraison"])
    }
  }, [project.service?.phases])

  // Effet séparé pour définir la phase actuelle une fois que nous avons les phases
  useEffect(() => {
    if (phases.length > 0) {
      // S'il n'y a pas de phase actuelle définie, on prend la première
      if (!project.current_phase) {
        setCurrentPhase(phases[0])
      } else {
        // Vérifier si la phase actuelle existe dans les phases disponibles
        if (phases.includes(project.current_phase)) {
          setCurrentPhase(project.current_phase)
        } else {
          // Si la phase n'existe pas, prendre la première
          setCurrentPhase(phases[0])
        }
      }
    }
  }, [phases, project.current_phase])

  const handlePhaseChange = (phase: string) => {
    setCurrentPhase(phase)
  }

  const handleSavePhase = async () => {
    if (!currentPhase) return
    
    setIsSaving(true)
    try {
      const success = await updateProjectPhase(project.id, currentPhase)
      
      if (success) {
        toast({
          title: "Succès",
          description: "La phase du projet a été mise à jour.",
        })
        onPhaseUpdated()
      } else {
        throw new Error('Failed to update project phase')
      }
    } catch (error) {
      console.error('Error updating project phase:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la phase du projet.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPhaseIndex = (phase: string) => {
    return phases.findIndex(p => p === phase)
  }

  const isCompleted = (phase: string) => {
    const currentIndex = getPhaseIndex(currentPhase)
    const phaseIndex = getPhaseIndex(phase)
    return phaseIndex < currentIndex
  }

  const isCurrent = (phase: string) => {
    return phase === currentPhase
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phases du projet</CardTitle>
        <CardDescription>
          Gérez l'avancement du projet à travers les différentes phases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Progression du projet</h3>
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div key={index} className="flex items-center gap-4">
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 
                    ${isCompleted(phase) 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : isCurrent(phase)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                    }`}
                >
                  {isCompleted(phase) ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isCurrent(phase) ? 'text-blue-700' : ''}`}>
                    {phase}
                    {isCurrent(phase) && (
                      <Badge variant="outline" className="ml-2 bg-blue-50">
                        Phase actuelle
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Définir la phase actuelle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select 
                value={currentPhase} 
                onValueChange={handlePhaseChange}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase, index) => (
                    <SelectItem key={index} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSavePhase} 
              disabled={isSaving || currentPhase === project.current_phase}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex flex-col space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between w-full">
          <p>Les phases sont définies par le service sélectionné lors de la création du projet.</p>
          <p>Phase actuelle: <strong className="text-foreground">{project.current_phase || 'Non définie'}</strong></p>
        </div>
        {currentPhase !== project.current_phase && (
          <div className="bg-yellow-50 p-2 rounded-md text-yellow-800 w-full">
            Vous avez sélectionné une nouvelle phase ({currentPhase}) qui n'est pas encore enregistrée. Cliquez sur "Enregistrer" pour confirmer ce changement.
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 