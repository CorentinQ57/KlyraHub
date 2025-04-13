"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { fetchProjectById, fetchComments, addComment, fetchDeliverables, supabase } from '@/lib/supabase'
import { Project, Comment, Deliverable } from '@/lib/supabase'
import { motion } from 'framer-motion'
import DepositSpaces, { DepositSpacesSkeleton } from './components/DepositSpaces'
import { Skeleton } from '@/components/ui/skeleton'

// Définition des types étendus
type ProjectWithRelations = Project & {
  services?: { title: string; category_id: number } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
}

// Composant pour un commentaire
const CommentItem = ({ comment, userName }: { comment: Comment & { userName?: string }, userName: string }) => {
  const date = new Date(comment.created_at)
  
  return (
    <motion.div 
      className="border rounded-lg p-4 mb-4 bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{userName}</div>
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()} à {date.toLocaleTimeString().slice(0, 5)}
        </div>
      </div>
      <p className="text-gray-600">{comment.content}</p>
    </motion.div>
  )
}

// Composant pour un livrable
const DeliverableItem = ({ deliverable }: { deliverable: Deliverable }) => {
  return (
    <motion.div 
      className="flex items-center justify-between border rounded-lg p-4 mb-2 bg-background"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
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
    </motion.div>
  )
}

// Skeleton components
const ProjectDetailsSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="h-4 w-24">
        <Skeleton className="h-full w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="relative">
          <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
          <div className="space-y-8 relative">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted z-10">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="space-y-1 w-full">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Deposit Spaces Skeleton */}
      <DepositSpacesSkeleton />
      
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="space-y-4">
          {Array(2).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}

const ProjectSidebarSkeleton = () => {
  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage({ 
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
    // Redirect if not authenticated
    if (!authLoading && !user) {
      console.log("Not authenticated, redirecting to login")
      router.push('/login')
      return
    }

    if (user) {
      console.log("User authenticated, fetching project", params.id)
      loadProjectData()
    }
  }, [user, authLoading, params.id, router])

  const loadProjectData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch project (based on user role - admin can see any project)
      let projectData
      
      if (isAdmin) {
        // Admins can see any project
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
              duration,
              icon
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
        projectData = data
      } else if (user) {
        projectData = await fetchProjectById(params.id, user.id)
      }
      
      if (!projectData) {
        console.error('Project not found or access denied')
        router.push('/dashboard')
        return
      }
      
      setProject(projectData as ProjectWithRelations)
      
      // Fetch comments
      const commentsData = await fetchComments(projectData.id)
      
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
      const deliverablesData = await fetchDeliverables(projectData.id)
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
      const projectId = project.id
      const comment = await addComment(projectId, user.id, newComment)
      
      if (comment) {
        // Get user name
        const userName = user.user_metadata?.full_name || user.email || 'Vous'
        
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
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Main content skeleton */}
            <div className="lg:w-2/3">
              <ProjectDetailsSkeleton />
            </div>
            
            {/* Sidebar skeleton */}
            <div className="lg:w-1/3 space-y-6">
              <ProjectSidebarSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Projet non trouvé</h1>
          <p className="mt-2 text-muted-foreground">Le projet demandé n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main content */}
          <div className="lg:w-2/3">
            <div className="space-y-8">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Retour au dashboard
              </Link>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Projet #{project.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}
                    >
                      {statusLabels[project.status].label}
                    </span>
                  </div>
                </div>
                
                {isAdmin && (
                  <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
                    <Button>Modifier le projet</Button>
                  </Link>
                )}
              </div>
              
              {/* Project timeline */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Progression du projet</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
                  <div className="space-y-8 relative">
                    {/* Status step: Pending */}
                    <div className={`flex items-start gap-4 ${project.status === 'pending' ? 'opacity-100' : project.status === 'validated' || project.status === 'in_progress' || project.status === 'delivered' || project.status === 'completed' ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${project.status === 'pending' || project.status === 'validated' || project.status === 'in_progress' || project.status === 'delivered' || project.status === 'completed' ? 'bg-klyra text-white' : 'bg-muted text-muted-foreground'} z-10`}>
                        1
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">En attente de validation</h3>
                        <p className="text-sm text-muted-foreground">Le projet a été soumis et est en attente de validation par notre équipe.</p>
                      </div>
                    </div>
                    
                    {/* Status step: Validated */}
                    <div className={`flex items-start gap-4 ${project.status === 'validated' ? 'opacity-100' : project.status === 'in_progress' || project.status === 'delivered' || project.status === 'completed' ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${project.status === 'validated' || project.status === 'in_progress' || project.status === 'delivered' || project.status === 'completed' ? 'bg-klyra text-white' : 'bg-muted text-muted-foreground'} z-10`}>
                        2
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Projet validé</h3>
                        <p className="text-sm text-muted-foreground">Votre projet a été validé et est maintenant dans notre pipeline de production.</p>
                      </div>
                    </div>
                    
                    {/* Status step: In progress */}
                    <div className={`flex items-start gap-4 ${project.status === 'in_progress' ? 'opacity-100' : project.status === 'delivered' || project.status === 'completed' ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${project.status === 'in_progress' || project.status === 'delivered' || project.status === 'completed' ? 'bg-klyra text-white' : 'bg-muted text-muted-foreground'} z-10`}>
                        3
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">En cours de réalisation</h3>
                        <p className="text-sm text-muted-foreground">Notre équipe travaille actuellement sur votre projet.</p>
                      </div>
                    </div>
                    
                    {/* Status step: Delivered */}
                    <div className={`flex items-start gap-4 ${project.status === 'delivered' ? 'opacity-100' : project.status === 'completed' ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${project.status === 'delivered' || project.status === 'completed' ? 'bg-klyra text-white' : 'bg-muted text-muted-foreground'} z-10`}>
                        4
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Livrables disponibles</h3>
                        <p className="text-sm text-muted-foreground">Les livrables de votre projet sont disponibles. Veuillez vérifier et valider.</p>
                      </div>
                    </div>
                    
                    {/* Status step: Completed */}
                    <div className={`flex items-start gap-4 ${project.status === 'completed' ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${project.status === 'completed' ? 'bg-klyra text-white' : 'bg-muted text-muted-foreground'} z-10`}>
                        5
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">Projet terminé</h3>
                        <p className="text-sm text-muted-foreground">Le projet est terminé. Merci pour votre confiance !</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deliverables */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Livrables</h2>
                {deliverables.length > 0 ? (
                  <div className="space-y-2">
                    {deliverables.map((deliverable) => (
                      <DeliverableItem key={deliverable.id} deliverable={deliverable} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun livrable n'est disponible pour le moment.</p>
                )}
              </div>
              
              {/* Upload Requests */}
              <DepositSpaces projectId={project.id} />
              
              {/* Comments */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Commentaires</h2>
                
                {/* Comment list */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        userName={comment.userName || 'Utilisateur'} 
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucun commentaire pour le moment.</p>
                  )}
                </div>
                
                {/* Comment form */}
                <form onSubmit={handleSubmitComment} className="mt-6">
                  <div className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="w-full min-h-[100px] p-3 border rounded-lg"
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={isCommenting || !newComment.trim()}
                      className="w-full sm:w-auto"
                    >
                      {isCommenting ? 'Envoi en cours...' : 'Ajouter un commentaire'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <div className="rounded-lg border bg-background p-6 shadow-sm sticky top-24">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Détails du projet</h2>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{project.title.split(' - ')[0]}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}
                    >
                      {statusLabels[project.status].label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date de création</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dernière mise à jour</span>
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-medium">{project.price}€</span>
                  </div>
                  
                  {isAdmin && project.profiles && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Client</span>
                        <span className="font-medium">{project.profiles.full_name || project.profiles.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 