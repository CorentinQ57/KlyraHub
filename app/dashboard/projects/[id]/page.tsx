"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { 
  fetchProjectById,
  fetchComments,
  fetchDeliverables,
  addComment,
  supabase,
  Project,
  Comment,
  Deliverable
} from '@/lib/supabase'
import { motion } from 'framer-motion'
import ClientUploadRequests from './components/ClientUploadRequests'
import { toast } from '@/components/ui/use-toast'

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
    setIsLoading(true);
    
    // Timeout de 10 secondes pour éviter un chargement infini
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Chargement du projet a expiré'));
      }, 10000);
    });
    
    try {
      // Charger le projet de base
      const loadProject = async () => {
        try {
          let projectData;
          if (isAdmin) {
            console.log("Admin loading project details");
            // Pour les admins, on utilise une requête directe à Supabase
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
              .single();
              
            if (error) {
              console.error("Error fetching project as admin:", error);
              return null;
            }
            
            projectData = data;
          } else {
            console.log("Client loading project details");
            projectData = await fetchProjectById(params.id, user?.id || '');
          }
          
          if (!projectData) {
            console.error("Project not found");
            toast({
              title: "Erreur",
              description: "Projet non trouvé",
              variant: "destructive",
            });
            router.push('/dashboard');
            return null;
          }
          
          return projectData;
        } catch (error) {
          console.error('Error loading project:', error);
          return null;
        }
      };
      
      // Promesse qui encapsule le chargement du projet
      const projectPromise = loadProject();
      
      // Course entre le chargement et le timeout
      const projectData = await Promise.race([projectPromise, timeoutPromise]) as any;
      
      if (!projectData) {
        setIsLoading(false);
        return;
      }
      
      setProject(projectData);
      
      // Chargement des commentaires
      if (!isAdmin) {
        try {
          const commentsData = await fetchComments(params.id);
          setComments(commentsData);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
        
        // Chargement des livrables
        try {
          const deliverablesData = await fetchDeliverables(params.id);
          setDeliverables(deliverablesData);
        } catch (error) {
          console.error('Error loading deliverables:', error);
        }
      }
    } catch (error) {
      console.error('Error in loadProjectData:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet. Veuillez rafraîchir la page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-klyra">Klyra</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-klyra">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="text-sm font-medium transition-colors hover:text-klyra">
                Profil
              </Link>
              <Link href="/dashboard/marketplace" className="text-sm font-medium transition-colors hover:text-klyra">
                Marketplace
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" className="text-sm font-medium transition-colors hover:text-klyra">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Retour au Dashboard
            </Button>
          </div>
        </div>
      </header>
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
              <ClientUploadRequests projectId={project.id} />
              
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
                  
                  {project.deadline_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date limite</span>
                      <span className="font-medium">{new Date(project.deadline_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric'
                      })}</span>
                    </div>
                  )}
                  
                  {project.estimated_completion_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date estimée de fin</span>
                      <span className="font-medium">{new Date(project.estimated_completion_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  )}
                  
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