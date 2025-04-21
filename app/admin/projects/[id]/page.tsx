'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Project {
  id: string
  title: string
  description: string
  status: string
  client_id: string
  designer_id: string | null
  created_at: string
  updated_at: string
  price: number
  service_id: string
  client: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
  designer: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  } | null
  service: {
    id: string
    name: string
    description: string
  }
}

interface Comment {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    full_name: string
    avatar_url: string | null
  }
}

interface Deliverable {
  id: string
  project_id: string
  title: string
  description: string
  file_url: string
  created_at: string
  updated_at: string
}

interface Designer {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

export default function AdminProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [newDeliverableDescription, setNewDeliverableDescription] = useState('');
  const [newDeliverableFile, setNewDeliverableFile] = useState<File | null>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isAddingDeliverable, setIsAddingDeliverable] = useState(false);

  useEffect(() => {
    fetchProjectData();
    fetchDesigners();
  }, []);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(id, full_name, email, avatar_url),
          designer:profiles!projects_designer_id_fkey(id, full_name, email, avatar_url),
          service:services(id, name, description)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw projectError;
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        throw commentsError;
      }

      // Fetch deliverables
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (deliverablesError) {
        throw deliverablesError;
      }

      setProject(projectData);
      setComments(commentsData || []);
      setDeliverables(deliverablesData || []);
      setSelectedDesignerId(projectData?.designer_id || null);
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du projet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'designer')
        .order('full_name');

      if (error) {
        throw error;
      }

      setDesigners(data || []);
    } catch (error) {
      console.error('Error fetching designers:', error);
    }
  };

  const assignDesigner = async () => {
    if (!selectedDesignerId) {
      return;
    }

    try {
      setIsAssigning(true);
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          designer_id: selectedDesignerId,
          status: project?.status === 'pending' ? 'in_progress' : project?.status,
        })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Designer assigné',
        description: 'Le designer a été assigné au projet avec succès',
      });

      // Refresh project data
      fetchProjectData();
    } catch (error) {
      console.error('Error assigning designer:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner le designer',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setIsCommenting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment,
        });

      if (error) {
        throw error;
      }

      setNewComment('');
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été ajouté avec succès',
      });

      // Refresh comments
      fetchProjectData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du projet a été mis à jour avec succès',
      });

      // Refresh project data
      fetchProjectData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const addDeliverable = async () => {
    if (!newDeliverableTitle.trim() || !newDeliverableFile) {
      return;
    }

    try {
      setIsAddingDeliverable(true);
      
      // Upload file
      const fileExt = newDeliverableFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `deliverables/${projectId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, newDeliverableFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Add deliverable to database
      const { error } = await supabase
        .from('deliverables')
        .insert({
          project_id: projectId,
          title: newDeliverableTitle,
          description: newDeliverableDescription,
          file_url: urlData.publicUrl,
        });

      if (error) {
        throw error;
      }

      setNewDeliverableTitle('');
      setNewDeliverableDescription('');
      setNewDeliverableFile(null);
      
      toast({
        title: 'Livrable ajouté',
        description: 'Le livrable a été ajouté avec succès',
      });

      // Refresh deliverables
      fetchProjectData();
    } catch (error) {
      console.error('Error adding deliverable:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le livrable',
        variant: 'destructive',
      });
    } finally {
      setIsAddingDeliverable(false);
    }
  };

  const deleteDeliverable = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('deliverables')
        .delete()
        .eq('id', deliverableId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Livrable supprimé',
        description: 'Le livrable a été supprimé avec succès',
      });

      // Refresh deliverables
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le livrable',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      review: 'En révision',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Projet non trouvé</h2>
        <p className="mt-2 text-gray-500">Le projet demandé n'existe pas ou a été supprimé</p>
        <Link href="/admin/projects">
          <Button className="mt-4">
            Retour à la liste des projets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/projects" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour aux projets
          </Link>
          <h1 className="text-3xl font-bold mt-2">{project.title}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="text-gray-500">
              #{project.id.slice(0, 8)} 
            </span>
            <span className="text-gray-500">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
            <span className="font-semibold">
              {project.price}€
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <select 
            value={project.status}
            onChange={(e) => updateProjectStatus(e.target.value)}
            className="rounded border-gray-300"
          >
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="review">En révision</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne gauche - Informations du projet */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du projet</CardTitle>
              <CardDescription>Informations du projet et du service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Service</h3>
                <p>{project.service.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{project.description || 'Aucune description'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Livrables</CardTitle>
              <CardDescription>Fichiers et documents livrés au client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliverables.length === 0 ? (
                <p className="text-gray-500">Aucun livrable pour ce projet</p>
              ) : (
                <div className="space-y-4">
                  {deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{deliverable.title}</h4>
                        <p className="text-sm text-gray-500">{deliverable.description || 'Aucune description'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(deliverable.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            Télécharger
                          </Button>
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteDeliverable(deliverable.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Ajouter un livrable</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre du livrable"
                    className="w-full p-2 border rounded"
                    value={newDeliverableTitle}
                    onChange={(e) => setNewDeliverableTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Description (optionnel)"
                    className="w-full p-2 border rounded"
                    rows={2}
                    value={newDeliverableDescription}
                    onChange={(e) => setNewDeliverableDescription(e.target.value)}
                  />
                  <input
                    type="file"
                    className="w-full p-2 border rounded"
                    onChange={(e) => setNewDeliverableFile(e.target.files?.[0] || null)}
                  />
                  <Button 
                    onClick={addDeliverable}
                    disabled={!newDeliverableTitle || !newDeliverableFile || isAddingDeliverable}
                  >
                    {isAddingDeliverable ? 'Ajout en cours...' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
              <CardDescription>Échanges avec le client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <textarea
                  placeholder="Ajouter un commentaire..."
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  onClick={addComment}
                  disabled={!newComment.trim() || isCommenting}
                  className="mt-2"
                >
                  {isCommenting ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </div>

              {comments.length === 0 ? (
                <p className="text-gray-500">Aucun commentaire pour ce projet</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                          {comment.user.avatar_url ? (
                            <img src={comment.user.avatar_url} alt={comment.user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold">{comment.user.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium">{comment.user.full_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Informations client et attribution */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
              <CardDescription>Informations du client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {project.client.avatar_url ? (
                    <img src={project.client.avatar_url} alt={project.client.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{project.client.full_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{project.client.full_name}</h3>
                  <p className="text-sm text-gray-500">{project.client.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attribution</CardTitle>
              <CardDescription>Designer assigné au projet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.designer ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {project.designer.avatar_url ? (
                      <img src={project.designer.avatar_url} alt={project.designer.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold">{project.designer.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{project.designer.full_name}</h3>
                    <p className="text-sm text-gray-500">{project.designer.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-yellow-600">Aucun designer assigné</p>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Assigner un designer</h3>
                <div className="space-y-2">
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedDesignerId || ''}
                    onChange={(e) => setSelectedDesignerId(e.target.value)}
                  >
                    <option value="">Sélectionner un designer</option>
                    {designers.map((designer) => (
                      <option key={designer.id} value={designer.id}>
                        {designer.full_name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={assignDesigner}
                    disabled={!selectedDesignerId || isAssigning}
                    className="w-full"
                  >
                    {isAssigning ? 'Attribution en cours...' : 'Assigner'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 