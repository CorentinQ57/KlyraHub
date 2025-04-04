"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { getUploadRequests, submitUploadRequest } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { UploadRequest } from '@/lib/supabase'
import { motion } from 'framer-motion'

type ClientUploadRequestsProps = {
  projectId: string
}

export default function ClientUploadRequests({ projectId }: ClientUploadRequestsProps) {
  const [requests, setRequests] = useState<UploadRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({})
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [projectId])

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const data = await getUploadRequests(projectId)
      setRequests(data)
      
      // Initialiser les fichiers sélectionnés
      const newSelectedFiles: {[key: string]: File | null} = {}
      data.forEach(request => {
        newSelectedFiles[request.id] = null
      })
      setSelectedFiles(newSelectedFiles)
    } catch (error) {
      console.error('Error loading upload requests:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de fichiers.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newSelectedFiles = { ...selectedFiles }
      newSelectedFiles[requestId] = e.target.files[0]
      setSelectedFiles(newSelectedFiles)
    }
  }

  const handleSubmitFile = async (requestId: string) => {
    if (!user || !selectedFiles[requestId]) return
    
    setUploadingRequestId(requestId)
    try {
      const success = await submitUploadRequest(
        requestId,
        selectedFiles[requestId]!,
        user.id
      )
      
      if (success) {
        toast({
          title: "Succès",
          description: "Votre fichier a été envoyé avec succès.",
        })
        
        // Recharger les demandes
        loadRequests()
      } else {
        throw new Error('Failed to submit file')
      }
    } catch (error) {
      console.error('Error submitting file:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le fichier.",
        variant: "destructive",
      })
    } finally {
      setUploadingRequestId(null)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">En attente</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Complété</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (requests.length === 0 && !isLoading) {
    return null; // Ne pas afficher le composant s'il n'y a pas de demandes
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold">Demandes de fichiers</h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement des demandes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    {request.description && (
                      <CardDescription className="mt-1">{request.description}</CardDescription>
                    )}
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Demandé le {formatDate(request.created_at)}
                </div>
                
                {request.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor={`file-${request.id}`} className="block text-sm font-medium">
                        Sélectionner un fichier
                      </label>
                      <Input
                        id={`file-${request.id}`}
                        type="file"
                        onChange={(e) => handleFileChange(request.id, e)}
                        disabled={uploadingRequestId === request.id}
                      />
                      {selectedFiles[request.id] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fichier sélectionné: {selectedFiles[request.id]?.name} ({Math.round((selectedFiles[request.id]?.size || 0) / 1024)} Ko)
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleSubmitFile(request.id)}
                      disabled={uploadingRequestId === request.id || !selectedFiles[request.id]}
                    >
                      {uploadingRequestId === request.id ? 'Envoi en cours...' : 'Envoyer le fichier'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {request.file_url && (
                      <a 
                        href={request.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-4 w-4 mr-1"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Voir le fichier téléchargé
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
} 