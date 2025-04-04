"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from '@/components/ui/use-toast'
import { fetchDeliverables, addDeliverable, deleteDeliverable, uploadFile } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { Deliverable } from '@/lib/supabase'

type ProjectDeliverablesProps = {
  project: any
  onDeliverablesUpdated: () => void
}

export default function ProjectDeliverables({ project, onDeliverablesUpdated }: ProjectDeliverablesProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [newDeliverableName, setNewDeliverableName] = useState('')
  const [newDeliverableDescription, setNewDeliverableDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadDeliverables()
  }, [project.id])

  const loadDeliverables = async () => {
    setIsLoading(true)
    try {
      // Si les livrables sont déjà préchargés dans le projet, les utiliser
      if (project.deliverables && Array.isArray(project.deliverables)) {
        console.log('Using preloaded deliverables:', project.deliverables.length);
        setDeliverables(project.deliverables);
      } else {
        // Sinon, charger les livrables depuis la base de données
        const data = await fetchDeliverables(project.id);
        setDeliverables(data);
      }
    } catch (error) {
      console.error('Error loading deliverables:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les livrables.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAddDeliverable = async () => {
    if (!selectedFile || !newDeliverableName.trim() || !user) return
    
    setIsUploading(true)
    try {
      console.log(`Uploading file: ${selectedFile.name} (${selectedFile.size} bytes)`)
      
      // 1. Upload the file
      const fileUrl = await uploadFile(selectedFile, project.id)
      
      if (!fileUrl) {
        toast({
          title: "Erreur de téléchargement",
          description: "Le fichier n'a pas pu être téléchargé. Vérifiez que le bucket 'files' existe dans Supabase.",
          variant: "destructive",
        })
        return
      }
      
      // 2. Create the deliverable record
      const deliverable = await addDeliverable(
        project.id,
        newDeliverableName,
        fileUrl,
        selectedFile.type || 'unknown',
        user.id
      )
      
      if (deliverable) {
        // Refresh the list
        loadDeliverables()
        
        // Reset form
        setNewDeliverableName('')
        setNewDeliverableDescription('')
        setSelectedFile(null)
        
        toast({
          title: "Succès",
          description: "Le livrable a été ajouté.",
        })
        
        onDeliverablesUpdated()
      } else {
        throw new Error('Failed to add deliverable record')
      }
    } catch (error) {
      console.error('Error adding deliverable:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter le livrable.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDeliverable = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livrable ?')) return
    
    try {
      const success = await deleteDeliverable(id)
      
      if (success) {
        // Optimistic update
        setDeliverables(deliverables.filter(item => item.id !== id))
        
        toast({
          title: "Succès",
          description: "Le livrable a été supprimé.",
        })
        
        onDeliverablesUpdated()
      } else {
        throw new Error('Failed to delete deliverable')
      }
    } catch (error) {
      console.error('Error deleting deliverable:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le livrable.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes('image')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip') || type.includes('rar')) return '🗜️'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
    return '📁'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livrables</CardTitle>
        <CardDescription>
          Gérez les fichiers à livrer au client
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des livrables...</p>
          </div>
        ) : (
          <>
            {deliverables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun livrable n'a été ajouté pour ce projet.</p>
              </div>
            ) : (
              <Table>
                <TableCaption>Liste des livrables du projet</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliverables.map(deliverable => (
                    <TableRow key={deliverable.id}>
                      <TableCell>
                        <a 
                          href={deliverable.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          {getFileTypeIcon(deliverable.type || '')}
                          {deliverable.name}
                        </a>
                      </TableCell>
                      <TableCell>{deliverable.type || 'Inconnu'}</TableCell>
                      <TableCell>{formatDate(deliverable.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDeliverable(deliverable.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-medium mb-4">Ajouter un livrable</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Nom du livrable
                  </label>
                  <Input
                    id="name"
                    value={newDeliverableName}
                    onChange={(e) => setNewDeliverableName(e.target.value)}
                    disabled={isUploading}
                    placeholder="ex: Maquette finale"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newDeliverableDescription}
                    onChange={(e) => setNewDeliverableDescription(e.target.value)}
                    disabled={isUploading}
                    placeholder="Description du livrable"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="file" className="block text-sm font-medium">
                    Fichier
                  </label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Fichier sélectionné: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} Ko)
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={handleAddDeliverable}
                  disabled={isUploading || !selectedFile || !newDeliverableName.trim()}
                  className="mt-2"
                >
                  {isUploading ? 'Téléchargement en cours...' : 'Ajouter le livrable'}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 