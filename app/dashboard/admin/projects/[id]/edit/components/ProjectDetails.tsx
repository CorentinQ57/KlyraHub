"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'
import { updateProject, supabase } from '@/lib/supabase'
import { format, parseISO, isValid } from 'date-fns'

type ProjectDetailsProps = {
  project: any
  onProjectUpdated: () => void
}

export default function ProjectDetails({ project, onProjectUpdated }: ProjectDetailsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    status: project.status || 'pending',
    designer_id: project.designer_id || 'none',
    start_date: project.start_date || '',
    deadline_date: project.deadline_date || '',
    estimated_delivery_date: project.estimated_delivery_date || ''
  })
  const [availableDesigners, setAvailableDesigners] = useState<any[]>([])
  const [isLoadingDesigners, setIsLoadingDesigners] = useState(true)
  const { toast } = useToast()

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'validated', label: 'Validé' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'delivered', label: 'Livré' },
    { value: 'completed', label: 'Terminé' }
  ]

  // Fetch available designers
  useEffect(() => {
    const loadDesigners = async () => {
      setIsLoadingDesigners(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'designer')

        if (error) throw error
        setAvailableDesigners(data || [])
      } catch (error) {
        console.error('Error loading designers:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des designers.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingDesigners(false)
      }
    }

    loadDesigners()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = (newStatus: string) => {
    setFormData(prev => ({
      ...prev,
      status: newStatus
    }))
  }

  const handleDesignerChange = (designerId: string) => {
    setFormData(prev => ({
      ...prev,
      designer_id: designerId
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    try {
      // Traiter la valeur "none" comme undefined
      const designerId = formData.designer_id === "none" ? undefined : formData.designer_id || undefined
      
      // Préparer les dates pour l'API
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return undefined
        const date = new Date(dateString)
        return isValid(date) ? date.toISOString() : undefined
      }
      
      const updatedProject = await updateProject(project.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status as any,
        designer_id: designerId,
        start_date: formatDateForAPI(formData.start_date),
        deadline_date: formatDateForAPI(formData.deadline_date),
        estimated_delivery_date: formatDateForAPI(formData.estimated_delivery_date)
      })

      if (updatedProject) {
        toast({
          title: "Succès",
          description: "Le projet a été mis à jour.",
        })
        onProjectUpdated()
      } else {
        throw new Error('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le projet.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Format date for display
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, 'yyyy-MM-dd') : ''
    } catch (error) {
      return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du projet</CardTitle>
        <CardDescription>
          Informations générales du projet, assignation du designer et délais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Titre du projet
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prix (fixé lors de l'achat)
              </label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground flex items-center">
                {project.price} €
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSaving}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Statut
              </label>
              <Select 
                value={formData.status} 
                onValueChange={handleStatusChange}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Designer assigné
              </label>
              <Select 
                value={formData.designer_id} 
                onValueChange={handleDesignerChange}
                disabled={isSaving || isLoadingDesigners}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingDesigners ? "Chargement..." : "Sélectionner un designer"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun designer assigné</SelectItem>
                  {availableDesigners.map((designer) => (
                    <SelectItem key={designer.id} value={designer.id}>
                      {designer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="start_date" className="text-sm font-medium">
                Date de début
              </label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formatDateForInput(formData.start_date)}
                onChange={handleDateChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline_date" className="text-sm font-medium">
                Date d'échéance (deadline)
              </label>
              <Input
                id="deadline_date"
                name="deadline_date"
                type="date"
                value={formatDateForInput(formData.deadline_date)}
                onChange={handleDateChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="estimated_delivery_date" className="text-sm font-medium">
                Date de livraison estimée
              </label>
              <Input
                id="estimated_delivery_date"
                name="estimated_delivery_date"
                type="date"
                value={formatDateForInput(formData.estimated_delivery_date)}
                onChange={handleDateChange}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 