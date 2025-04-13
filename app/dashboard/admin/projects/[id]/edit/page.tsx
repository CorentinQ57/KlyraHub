"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import ProjectDetails from './components/ProjectDetails'
import ProjectPhases from './components/ProjectPhases'
import ProjectComments from './components/ProjectComments'
import ProjectDeliverables from './components/ProjectDeliverables'
import ProjectUploadRequests from './components/ProjectUploadRequests'
import { fetchProjectDetailsForAdmin } from '@/lib/supabase'

export default function EditProjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      loadProjectData()
    }
  }, [user, authLoading, isAdmin, params.id, router])

  const loadProjectData = async () => {
    try {
      setIsLoading(true)
      const data = await fetchProjectDetailsForAdmin(params.id)
      
      if (!data) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le projet.",
          variant: "destructive",
        })
        return
      }
      
      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le projet.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "outline" },
      validated: { label: "Validé", variant: "secondary" },
      in_progress: { label: "En cours", variant: "default" },
      delivered: { label: "Livré", variant: "default" },
      completed: { label: "Terminé", variant: "default" }
    }
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Projet non trouvé</h1>
          <p className="mt-2 text-muted-foreground">Le projet demandé n'existe pas.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/admin')}>
            Retour à l'administration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link 
          href="/dashboard/admin" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à l'administration
        </Link>
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center mt-2 gap-3">
              {getStatusBadge(project.status)}
              <span className="text-sm text-muted-foreground">
                Client: {project.client?.full_name || 'Non assigné'}
              </span>
              <span className="text-sm text-muted-foreground">
                Designer: {project.designer?.full_name || 'Non assigné'}
              </span>
            </div>
          </div>
          <div>
            <Button 
              onClick={() => router.push(`/dashboard/admin/projects/${project.id}`)}
              variant="outline"
            >
              Voir le projet
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="deliverables">Livrables</TabsTrigger>
          <TabsTrigger value="comments">Commentaires</TabsTrigger>
          <TabsTrigger value="uploads">Demandes de fichiers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <ProjectDetails project={project} onProjectUpdated={loadProjectData} />
        </TabsContent>
        
        <TabsContent value="phases" className="mt-6">
          <ProjectPhases project={project} onPhaseUpdated={loadProjectData} />
        </TabsContent>
        
        <TabsContent value="deliverables" className="mt-6">
          <ProjectDeliverables project={project} onDeliverablesUpdated={loadProjectData} />
        </TabsContent>
        
        <TabsContent value="comments" className="mt-6">
          <ProjectComments project={project} onCommentsUpdated={loadProjectData} />
        </TabsContent>
        
        <TabsContent value="uploads" className="mt-6">
          <ProjectUploadRequests project={project} onRequestsUpdated={loadProjectData} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 