"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth'
import { 
  supabase, 
  fetchProjectById, 
  fetchComments, 
  fetchDeliverables, 
  addComment 
} from '@/lib/supabase'
import { Project, Comment, Deliverable } from '@/lib/supabase'

// Type étendu pour le projet avec ses relations
type ProjectWithRelations = Project & {
  services?: any;
  client?: any;
  designer?: any;
}

// Composant pour un commentaire
const CommentItem = ({ comment, userName }: { comment: Comment & { userName?: string }, userName: string }) => {
  const date = new Date(comment.created_at)
  
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{userName}</div>
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()} à {date.toLocaleTimeString().slice(0, 5)}
        </div>
      </div>
      <p className="text-muted-foreground">{comment.content}</p>
    </div>
  )
}

// Composant pour un livrable
const DeliverableItem = ({ deliverable }: { deliverable: Deliverable }) => {
  return (
    <div className="flex items-center justify-between border rounded-lg p-4 mb-2">
      <div>
        <div className="font-medium">{deliverable.name}</div>
        <div className="text-sm text-muted-foreground">
          Ajouté le {new Date(deliverable.created_at).toLocaleDateString()}
        </div>
      </div>
      <a 
        href={deliverable.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="bg-klyra text-white px-4 py-2 rounded-md text-sm hover:bg-klyra/90 transition-colors"
      >
        Télécharger
      </a>
    </div>
  )
}

export default function AdminProjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [project, setProject] = useState<ProjectWithRelations | null>(null)
  const [comments, setComments] = useState<(Comment & { userName?: string })[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCommenting, setIsCommenting] = useState(false)
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()

  // Status labels
  const statusLabels: Record<string, { label: string, color: string }> = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800"
    },
    validated: {
      label: "Validé",
      color: "bg-blue-100 text-blue-800"
    },
    in_progress: {
      label: "En cours",
      color: "bg-purple-100 text-purple-800"
    },
    delivered: {
      label: "Livré",
      color: "bg-green-100 text-green-800"
    },
    completed: {
      label: "Terminé",
      color: "bg-gray-100 text-gray-800"
    },
  }

  useEffect(() => {
    // Redirect if not authenticated or not admin
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
      
      // Fetch project data
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          services (
            id,
            name,
            description,
            category_id,
            price,
            duration
          ),
          client:client_id (
            id,
            full_name,
            email
          ),
          designer:designer_id (
            id,
            full_name,
            email
          )
        `)
        .eq('id', params.id)
        .single()
        
      if (error) throw error
      
      setProject(data as ProjectWithRelations)
      
      // Fetch comments
      const commentsData = await fetchComments(params.id)
      
      // For each comment, fetch the user name if possible
      const commentsWithUserNames = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            if (comment.user_id) {
              const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', comment.user_id)
                .single()
                
              if (!error && data) {
                return {
                  ...comment,
                  userName: data.full_name || data.email || 'Utilisateur'
                }
              }
            }
            return comment
          } catch (error) {
            console.error('Error fetching comment user:', error)
            return comment
          }
        })
      )
      
      setComments(commentsWithUserNames)
      
      // Fetch deliverables
      const deliverablesData = await fetchDeliverables(params.id)
      setDeliverables(deliverablesData)
      
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project || !newComment.trim()) return
    
    try {
      setIsCommenting(true)
      const comment = await addComment(project.id, user.id, newComment)
      
      if (comment) {
        // Get user name
        const userName = user.user_metadata?.full_name || user.email || 'Admin'
        
        // Add optimistically
        setComments([
          ...comments,
          {
            ...comment,
            userName
          }
        ])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsCommenting(false)
    }
  }

  if (authLoading || isLoading) {
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
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <Link 
          href="/dashboard/admin" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à l'administration
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
              <Button className="bg-klyra hover:bg-klyra/90">
                Éditer le projet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="comments">Commentaires ({comments.length})</TabsTrigger>
              <TabsTrigger value="deliverables">Livrables ({deliverables.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{project.description || "Aucune description fournie."}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Service</h3>
                      <p className="mt-1 font-medium">{project.services?.name || "Non spécifié"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Prix</h3>
                      <p className="mt-1 font-medium">{project.price}€</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                      <p className="mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                      <p className="mt-1">{new Date(project.updated_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                      <div className="mt-1">
                        <Badge
                          className={`px-2 py-1 ${statusLabels[project.status]?.color || "bg-gray-100"}`}
                        >
                          {statusLabels[project.status]?.label || project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Commentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment} 
                          userName={comment.userName || 'Utilisateur'}
                        />
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Aucun commentaire pour le moment.</p>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmitComment} className="mt-6">
                    <div className="flex flex-col space-y-2">
                      <textarea
                        className="min-h-[100px] w-full rounded-md border border-input p-3 text-sm"
                        placeholder="Ajouter un commentaire..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={isCommenting}
                      />
                      <Button
                        type="submit"
                        className="ml-auto bg-klyra hover:bg-klyra/90"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? "Envoi..." : "Ajouter un commentaire"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deliverables">
              <Card>
                <CardHeader>
                  <CardTitle>Livrables</CardTitle>
                </CardHeader>
                <CardContent>
                  {deliverables.length > 0 ? (
                    <div className="space-y-2">
                      {deliverables.map(deliverable => (
                        <DeliverableItem key={deliverable.id} deliverable={deliverable} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun livrable n'a été fourni pour le moment.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                <p className="mt-1 font-medium">{project.client?.full_name || "Non spécifié"}</p>
                {project.client?.email && (
                  <p className="text-sm text-muted-foreground">{project.client.email}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Designer</h3>
                {project.designer ? (
                  <>
                    <p className="mt-1 font-medium">{project.designer.full_name}</p>
                    <p className="text-sm text-muted-foreground">{project.designer.email}</p>
                  </>
                ) : (
                  <p className="mt-1 text-yellow-600">Non assigné</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                Vue client
              </Button>
              <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
                <Button className="bg-klyra hover:bg-klyra/90">
                  Éditer
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 