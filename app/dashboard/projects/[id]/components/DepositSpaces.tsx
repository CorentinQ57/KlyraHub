"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { getUploadRequests, submitUploadRequest } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { UploadRequest } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { FileUpload } from '@/components/ui/file-upload'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type DepositSpacesProps = {
  projectId: string
}

// Skeleton component for deposit spaces
export function DepositSpacesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div>
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </CardHeader>
            
            <CardContent className="px-4 py-2">
              <Skeleton className="h-4 w-full" />
            </CardContent>
            
            <CardContent className="p-4 pt-2">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-24 w-full rounded-lg mb-4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DepositSpaces({ projectId }: DepositSpacesProps) {
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

  const handleFileChange = (requestId: string, files: File[]) => {
    if (files.length > 0) {
      const newSelectedFiles = { ...selectedFiles }
      newSelectedFiles[requestId] = files[0]
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
      year: 'numeric'
    }).format(date)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-800 border-none">En attente</Badge>
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border-none">Complété</Badge>
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-none">Rejeté</Badge>
      default:
        return <Badge className="border-none">{status}</Badge>
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
      <h2 className="text-xl font-semibold">Espaces de dépôt</h2>
      
      {isLoading ? (
        <DepositSpacesSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(request => (
            <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span>{request.name}</span>
                  </CardTitle>
                </div>
                <div>{getStatusBadge(request.status)}</div>
              </CardHeader>
              
              {request.description && (
                <CardContent className="px-4 py-2">
                  <CardDescription>{request.description}</CardDescription>
                </CardContent>
              )}
              
              <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground mb-3">
                  Demandé le {formatDate(request.created_at)}
                </div>
                
                {request.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="file-upload-wrapper">
                      <FileUpload 
                        onChange={(files) => handleFileChange(request.id, files)}
                        titleText="Télécharger un fichier"
                        subtitleText="Glissez ou déposez vos fichiers ici ou cliquez pour télécharger"
                      />
                    </div>
                    
                    <Button
                      onClick={() => handleSubmitFile(request.id)}
                      disabled={uploadingRequestId === request.id || !selectedFiles[request.id]}
                      className="w-full"
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