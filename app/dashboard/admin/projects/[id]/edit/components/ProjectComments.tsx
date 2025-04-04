"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { addComment, fetchComments } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

type Comment = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

type ProjectCommentsProps = {
  project: any
  onCommentsUpdated: () => void
}

export default function ProjectComments({ project, onCommentsUpdated }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
  }, [project.id])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      // Si les commentaires sont déjà préchargés dans le projet, les utiliser
      if (project.comments && Array.isArray(project.comments)) {
        console.log('Using preloaded comments:', project.comments.length);
        const commentsData = project.comments;
        
        // Ajout d'informations utilisateur
        const enhancedComments = await Promise.all(
          commentsData.map(async (comment: any) => {
            // Vérifier si le comment a déjà les infos utilisateur
            if (!comment.user) {
              // Vérifier si c'est le client
              if (comment.user_id === project.client_id) {
                comment.user = {
                  id: project.client.id,
                  full_name: project.client.full_name,
                  avatar_url: project.client.avatar_url
                };
              } 
              // Vérifier si c'est le designer
              else if (comment.user_id === project.designer_id && project.designer) {
                comment.user = {
                  id: project.designer.id,
                  full_name: project.designer.full_name,
                  avatar_url: project.designer.avatar_url
                };
              } 
              // Sinon, c'est probablement un admin
              else {
                comment.user = {
                  id: comment.user_id,
                  full_name: 'Admin',
                  avatar_url: ''
                };
              }
            }
            return comment;
          })
        );
        
        // Tri par date (plus récent en dernier)
        const sortedComments = enhancedComments.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setComments(sortedComments);
      } else {
        // Sinon, charger les commentaires depuis la base de données
        const commentsData = await fetchComments(project.id);
        
        // Ajout d'informations utilisateur
        const enhancedComments = await Promise.all(
          commentsData.map(async (comment) => {
            // Récupérer l'utilisateur si on ne l'a pas déjà
            if (!comment.user) {
              // Vérifier si c'est le client
              if (comment.user_id === project.client_id) {
                comment.user = {
                  id: project.client.id,
                  full_name: project.client.full_name,
                  avatar_url: project.client.avatar_url
                };
              } 
              // Vérifier si c'est le designer
              else if (comment.user_id === project.designer_id && project.designer) {
                comment.user = {
                  id: project.designer.id,
                  full_name: project.designer.full_name,
                  avatar_url: project.designer.avatar_url
                };
              } 
              // Sinon, c'est probablement un admin
              else {
                comment.user = {
                  id: comment.user_id,
                  full_name: 'Admin',
                  avatar_url: ''
                };
              }
            }
            return comment;
          })
        );
        
        // Tri par date (plus récent en dernier)
        const sortedComments = enhancedComments.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return
    
    setIsSending(true)
    try {
      const comment = await addComment(project.id, user.id, newComment)
      
      if (comment) {
        // Optimistic update
        const userInfo = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Admin',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
        
        const newCommentObject = {
          ...comment,
          user: userInfo
        }
        
        setComments([...comments, newCommentObject])
        setNewComment('')
        onCommentsUpdated()
      }
    } catch (error) {
      console.error('Error sending comment:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le commentaire.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
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

  const getUserInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Historique des échanges avec le client
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des messages...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun message pour ce projet.</p>
            <p className="text-sm mt-1">Commencez la conversation avec le client.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 p-1">
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className={`flex gap-3 ${comment.user_id === user?.id ? 'justify-end' : ''}`}
              >
                {comment.user_id !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={comment.user?.avatar_url || ''} 
                      alt={comment.user?.full_name || 'User'} 
                    />
                    <AvatarFallback>{getUserInitials(comment.user?.full_name || '')}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    comment.user_id === user?.id 
                      ? 'bg-klyra text-white ml-auto' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className={`text-xs font-medium ${comment.user_id === user?.id ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {comment.user?.full_name || 'Utilisateur'}
                    </p>
                    <p className={`text-xs ${comment.user_id === user?.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
                {comment.user_id === user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url || ''} 
                      alt={user.user_metadata?.full_name || 'Admin'} 
                    />
                    <AvatarFallback>{getUserInitials(user.user_metadata?.full_name || 'AD')}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t pt-4">
          <div className="flex items-start gap-3">
            <Textarea
              placeholder="Écrire un message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 min-h-[80px]"
              disabled={isSending}
            />
            <Button 
              onClick={handleSendComment} 
              disabled={!newComment.trim() || isSending}
              className="mt-1"
            >
              {isSending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 