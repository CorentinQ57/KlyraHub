'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { fetchProjectById, fetchComments, addComment, fetchDeliverables, supabase } from '@/lib/supabase';
import { Project, Comment, Deliverable } from '@/lib/supabase';
import { motion } from 'framer-motion';
import DepositSpaces from './components/DepositSpaces';
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
import { ArrowLeft, MessageSquare, FileText, ChevronRight, Clock, Settings, Download, Tag } from 'lucide-react';

// Définition des types étendus
type ProjectWithRelations = Project & {
  services?: { 
    id: string;
    name: string;
    description?: string;
    category_id?: string;
    price?: number;
    duration?: number;
    phases?: string[];
    category?: {
      id: string;
      name: string;
      description?: string;
      image_url?: string;
    } 
  } | null;
  client?: { 
    id: string;
    full_name: string | null; 
    email: string | null 
  } | null;
  designer?: { 
    id: string;
    full_name: string | null; 
    email: string | null 
  } | null;
  // Propriété ajoutée pour le débogage et le suivi de la phase normalisée
  normalized_phase?: string;
}

// Composant pour un commentaire
const CommentItem = ({ comment, userName }: { comment: Comment & { userName?: string }, userName: string }) => {
  const date = new Date(comment.created_at);
  
  return (
    <motion.div 
      className="border border-[#E2E8F0] rounded-lg p-4 mb-4 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-[14px]">{userName}</div>
        <div className="text-[12px] text-[#64748B]">
          {date.toLocaleDateString()} à {date.toLocaleTimeString().slice(0, 5)}
        </div>
      </div>
      <p className="text-[14px] text-[#1A2333]">{comment.content}</p>
    </motion.div>
  );
};

// Composant pour un livrable
const DeliverableItem = ({ deliverable }: { deliverable: Deliverable }) => {
  return (
    <motion.div 
      className="flex items-center justify-between border border-[#E2E8F0] rounded-lg p-4 mb-2 bg-white"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <div className="font-medium text-[14px]">{deliverable.name}</div>
        <div className="text-[12px] text-[#64748B]">
          Ajouté le {new Date(deliverable.created_at).toLocaleDateString()}
        </div>
      </div>
      <a 
        href={deliverable.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center text-[#467FF7] hover:text-[#3A6FE0] transition-colors"
      >
        <Download className="mr-2 h-4 w-4" />
        <span className="text-sm">Télécharger</span>
      </a>
    </motion.div>
  );
};

// Fonction pour obtenir le nom de la catégorie
function getCategoryName(project: ProjectWithRelations): string {
  // Cas 1: Accès via la structure correcte
  if (project.services?.category?.name) {
    return project.services.category.name;
  }
  // Cas 2: Utilisation des ID connus
  if (project.services?.category_id) {
    const categoryKey = String(project.services.category_id).toLowerCase();
    return categoryKey === '1b041ce2-1f9b-466f-8aa4-b94fec7d94ab' ? 'Développement Web'
      : categoryKey === 'ba8f9878-d327-4b2d-8be5-ae95df23e1a0' ? 'Branding'
      : categoryKey === '7227a841-69e8-48bb-85fd-d65d49618245' ? 'UI UX Design'
      : categoryKey === '53b49d36-18c7-467f-89fc-cd78331dc0d7' ? 'Social Media'
      : 'Catégorie';
  }
  // Cas 3: Si on a le nom du service, l'utiliser comme fallback
  if (project.services?.name) {
    return project.services.name || 'Service';
  }
  // Cas par défaut
  return 'Catégorie';
}

export default function ProjectPage({ 
  params, 
}: { 
  params: { id: string } 
}) {
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [comments, setComments] = useState<(Comment & { userName?: string })[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  
  // Status labels
  const statusLabels: Record<string, { label: string, color: string }> = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
    },
    validated: {
      label: 'Validé',
      color: 'bg-blue-100 text-blue-800',
    },
    in_progress: {
      label: 'En cours',
      color: 'bg-purple-100 text-purple-800',
    },
    delivered: {
      label: 'Livré',
      color: 'bg-green-100 text-green-800',
    },
    completed: {
      label: 'Terminé',
      color: 'bg-gray-100 text-gray-800',
    },
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (user) {
      console.log('User authenticated, fetching project', params.id);
      loadProjectData();
    }
  }, [user, authLoading, params.id, router]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch project (based on user role - admin can see any project)
      let projectData;
      
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
          .single();
          
        if (error) {
          throw error;
        }
        projectData = data;
      } else if (user) {
        projectData = await fetchProjectById(params.id, user.id);
      }
      
      if (!projectData) {
        console.error('Project not found or access denied');
        router.push('/dashboard');
        return;
      }
      
      setProject(projectData as ProjectWithRelations);
      
      // Fetch comments
      const commentsData = await fetchComments(projectData.id);
      
      // For each comment, fetch the user name if possible
      const commentsWithUserNames = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            if (comment.user_id) {
              const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', comment.user_id)
                .single();
                
              if (!error && data) {
                return {
                  ...comment,
                  userName: data.full_name || data.email || 'Utilisateur',
                };
              }
            }
            return comment;
          } catch (error) {
            console.error('Error fetching comment user:', error);
            return comment;
          }
        })
      );
      
      setComments(commentsWithUserNames);
      
      // Fetch deliverables
      const deliverablesData = await fetchDeliverables(projectData.id);
      setDeliverables(deliverablesData);
      
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim() || !project) {
      return;
    }
    
    try {
      setIsCommenting(true);
      
      // Add comment - vérifions si la fonction addComment attend des paramètres séparés ou un objet
      const commentResult = await addComment(project.id, user.id, newComment);
      
      if (commentResult) {
        // Update comments list
        setComments([
          ...comments,
          {
            ...commentResult,
            userName: user.user_metadata?.full_name || user.email || 'Vous',
          },
        ]);
      }
      
      // Clear input
      setNewComment('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  // Fonction pour convertir les phases du service en tableau d'objets structurés
  const getProjectPhases = (project: ProjectWithRelations) => {
    console.log('Phase actuelle brute:', project.current_phase);
    
    // Si le service a des phases définies, les utiliser
    if (project.services?.phases && Array.isArray(project.services.phases) && project.services.phases.length > 0) {
      console.log('Phases du service trouvées:', project.services.phases);
      
      const phases = project.services.phases.map(phase => {
        // Normaliser la clé de la phase 
        const key = typeof phase === 'string' 
          ? phase.toLowerCase().replace(/\s+/g, '_')
          : 'phase';
        
        return {
          key,
          label: typeof phase === 'string' ? phase : 'Phase'
        };
      });
      
      console.log('Phases normalisées:', phases.map(p => p.key));
      return phases;
    }

    // Phases par défaut si non définies dans le service
    const defaultPhases = [
      { key: 'briefing_initial', label: 'Briefing initial' },
      { key: 'conception', label: 'Conception' },
      { key: 'design_et_développement', label: 'Design et développement' },
      { key: 'révisions', label: 'Révisions' },
      { key: 'finalisation', label: 'Finalisation' }
    ];
    
    console.log('Utilisation des phases par défaut:', defaultPhases.map(p => p.key));
    return defaultPhases;
  };

  // Fonction pour déterminer si une phase est la phase actuelle
  const isCurrentPhase = (phase: {key: string, label: string}, currentPhase?: string): boolean => {
    if (!currentPhase) return false;
    
    const normalizedCurrentPhase = currentPhase.toLowerCase().replace(/\s+/g, '_');
    const normalizedPhaseKey = phase.key.toLowerCase();
    const normalizedPhaseLabel = phase.label.toLowerCase().replace(/\s+/g, '_');
    
    // Vérifier la correspondance exacte sur la clé ou le label
    if (normalizedCurrentPhase === normalizedPhaseKey || normalizedCurrentPhase === normalizedPhaseLabel) {
      return true;
    }
    
    // Vérifier la correspondance partielle
    if (normalizedCurrentPhase.includes(normalizedPhaseKey) || 
        normalizedPhaseKey.includes(normalizedCurrentPhase) ||
        normalizedCurrentPhase.includes(normalizedPhaseLabel) || 
        normalizedPhaseLabel.includes(normalizedCurrentPhase)) {
      return true;
    }
    
    return false;
  };

  // Fonction pour déterminer si une phase est déjà passée
  const isPastPhase = (phase: {key: string, label: string}, index: number, phases: {key: string, label: string}[], currentPhase?: string): boolean => {
    if (!currentPhase) return false;
    
    // Trouver l'index de la phase actuelle
    const currentPhaseIndex = phases.findIndex(p => isCurrentPhase(p, currentPhase));
    
    // Si on n'a pas trouvé la phase actuelle ou si cet index est avant la phase actuelle
    if (currentPhaseIndex === -1 || index >= currentPhaseIndex) {
      return false;
    }
    
    return true;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement du projet...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-10">
          <h2 className="text-[18px] font-semibold mb-2">Projet non trouvé</h2>
          <p className="text-[14px] text-[#64748B] mb-6">
            Ce projet n'existe pas ou vous n'avez pas les autorisations nécessaires.
          </p>
          <Link href="/dashboard">
            <Button>
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={project.title}
        description={`Projet #${project.id} - ${statusLabels[project.status]?.label || project.status}`}
      >
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/dashboard/admin/projects/${project.id}/edit`}>
              <Button>
                <Settings className="mr-2 h-4 w-4" /> Gérer le projet
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations et commentaires */}
        <div className="lg:col-span-2 space-y-6">
          <PageSection title="Détails du projet">
            <ContentCard>
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#EBF2FF] text-[#467FF7]">
                  <Tag className="mr-2 h-4 w-4" />
                  {getCategoryName(project)}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Service</h3>
                  <p className="text-[16px]">{project.services?.name || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Client</h3>
                  <p className="text-[16px]">{project.client?.full_name || project.client?.email || 'Non assigné'}</p>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Statut</h3>
                  <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusLabels[project.status]?.color}`}>
                    {statusLabels[project.status]?.label || project.status}
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Date de création</h3>
                  <p className="text-[16px] flex items-center">
                    <Clock className="mr-1.5 h-4 w-4 text-[#64748B]" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Dernière mise à jour</h3>
                  <p className="text-[16px] flex items-center">
                    <Clock className="mr-1.5 h-4 w-4 text-[#64748B]" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-[#64748B] mb-1">Phase actuelle</h3>
                  <div className="flex items-center">
                    <div className="inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white mr-2">
                      {project.current_phase || 'Démarrage'}
                    </div>
                    <div className="text-[12px] text-blue-700">
                      {(() => {
                        const phases = getProjectPhases(project);
                        const currentIndex = phases.findIndex(p => isCurrentPhase(p, project.current_phase));
                        if (currentIndex === -1) return '';
                        return `Étape ${currentIndex + 1} sur ${phases.length}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-[14px] font-medium text-[#64748B] mb-2">Description</h3>
                <p className="text-[14px]">{project.description || 'Aucune description disponible pour ce projet.'}</p>
              </div>
            </ContentCard>
          </PageSection>

          {/* Section des phases du projet */}
          <PageSection 
            title="Phases du projet" 
            description="Le déroulement de votre projet étape par étape"
          >
            <ContentCard>
              {/* Logs de débogage pour identifier la phase actuelle */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="bg-yellow-50 p-3 mb-4 border border-yellow-200 rounded text-xs">
                  <p><strong>Débogage phases:</strong> Phase actuelle = "{project.current_phase || 'non définie'}"</p>
                  <p>Phases disponibles: {getProjectPhases(project).map(p => `"${p.key}"`).join(', ')}</p>
                </div>
              )}
              
              {/* Timeline visuelle des phases */}
              <div className="mb-6">
                {(() => {
                  const phases = getProjectPhases(project);
                  const totalPhases = phases.length;
                  
                  return (
                    <div className="relative">
                      {/* Ligne de connexion entre les étapes */}
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
                      
                      {/* Étapes de la timeline */}
                      <div className="relative flex justify-between items-start">
                        {phases.map((phase, index) => {
                          const current = isCurrentPhase(phase, project.current_phase);
                          const past = isPastPhase(phase, index, phases, project.current_phase);
                          
                          // Déterminer le statut pour le style
                          let status: 'completed' | 'current' | 'upcoming' = "upcoming";
                          if (current) status = "current";
                          else if (past) status = "completed";
                          
                          // Classes en fonction du statut
                          const circleClasses: Record<'completed' | 'current' | 'upcoming', string> = {
                            completed: "bg-green-500 text-white border-green-500",
                            current: "bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100",
                            upcoming: "bg-white text-gray-400 border-gray-300"
                          };
                          
                          const labelClasses: Record<'completed' | 'current' | 'upcoming', string> = {
                            completed: "text-green-700 font-medium",
                            current: "text-blue-700 font-semibold",
                            upcoming: "text-gray-500"
                          };
                          
                          return (
                            <div key={phase.key} className="flex flex-col items-center relative z-10" style={{width: `${100/totalPhases}%`}}>
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${circleClasses[status]}`}>
                                {past ? "✓" : index + 1}
                              </div>
                              <div className="mt-2 text-center">
                                <div className={`text-xs ${labelClasses[status]}`}>
                                  {phase.label}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Ligne de progression remplie */}
                      <div className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500 ease-in-out" style={{
                        width: (() => {
                          const phases = getProjectPhases(project);
                          const currentIndex = phases.findIndex(p => isCurrentPhase(p, project.current_phase));
                          
                          if (currentIndex === -1) return "0%";
                          
                          // Si c'est la première phase, progression à 10%
                          if (currentIndex === 0) return "10%";
                          
                          // Si c'est la dernière phase, progression à 90%
                          if (currentIndex === phases.length - 1) return "90%";
                          
                          // Sinon, calculer le pourcentage en fonction de l'index
                          return `${(currentIndex / (phases.length - 1)) * 100}%`;
                        })()
                      }} />
                    </div>
                  );
                })()}
              </div>
            
              <div className="space-y-4">
                {(() => {
                  const phases = getProjectPhases(project);
                  
                  return phases.map((phase, index) => {
                    const current = isCurrentPhase(phase, project.current_phase);
                    const past = isPastPhase(phase, index, phases, project.current_phase);
                    
                    return (
                      <div 
                        key={phase.key}
                        className={`relative flex items-start p-4 rounded-md border-2 ${
                          current ? 'border-blue-600 bg-blue-50' : 
                            past ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full mr-3 text-lg
                          ${current ? 'bg-blue-600 text-white font-bold' : 
                            past ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                        >
                          {past ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-[17px] font-medium ${
                            current ? 'text-blue-700' : 
                              past ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {phase.label}
                          </h4>
                          <p className={`text-[14px] mt-1 ${
                            current ? 'text-blue-600 font-medium' : 
                              past ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {current ? "Phase en cours" : 
                              past ? "Phase terminée" : "Phase à venir"}
                          </p>
                        </div>
                        {current && (
                          <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm">
                            <span className="flex h-3 w-3 mr-1.5">
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            </span>
                            PHASE ACTUELLE
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </ContentCard>
          </PageSection>

          <PageSection 
            title="Espaces de dépôt" 
            description="Déposez vos fichiers dans les espaces dédiés"
          >
            <ContentCard>
              <DepositSpaces projectId={project.id} />
            </ContentCard>
          </PageSection>
        </div>
        
        {/* Colonne latérale - Livrables et statut */}
        <div className="space-y-6">
          <PageSection title="Livrables">
            <ContentCard>
              {deliverables.length > 0 ? (
                <div className="space-y-3">
                  {deliverables.map(deliverable => (
                    <DeliverableItem key={deliverable.id} deliverable={deliverable} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-12 w-12 text-[#E2E8F0] mb-2" />
                  <h3 className="text-[16px] font-medium mb-1">Aucun livrable</h3>
                  <p className="text-[14px] text-[#64748B]">
                    Les livrables seront ajoutés ici lorsqu'ils seront disponibles.
                  </p>
                </div>
              )}
            </ContentCard>
          </PageSection>
          
          <PageSection title="Avancement">
            <ContentCard>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-[#E2E8F0]">
                    <div
                      style={{ width: getProgressPercentage(project.status) }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#467FF7]"
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {renderProjectSteps(project.status)}
                </div>
              </div>
            </ContentCard>
          </PageSection>
          
          {/* Section des commentaires en dessous de l'avancement */}
          <PageSection 
            title="Commentaires" 
            description="Échanger avec l'équipe du projet"
          >
            <ContentCard>
              <div className="space-y-2">
                {comments.length > 0 ? (
                  comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(comment => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      userName={comment.userName || 'Utilisateur'}
                    />
                  ))
                ) : (
                  <p className="text-[14px] text-[#64748B] py-4">Aucun commentaire pour le moment.</p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <form onSubmit={handleSubmitComment}>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="comment" className="text-[14px] font-medium">
                      Ajouter un commentaire
                    </label>
                    <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] p-3 border border-[#E2E8F0] rounded-md w-full text-[14px]"
                      placeholder="Votre commentaire..."
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {isCommenting ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </ContentCard>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}

function getProgressPercentage(status: string): string {
  const progressMap: Record<string, string> = {
    pending: '10%',
    validated: '30%',
    in_progress: '60%',
    delivered: '90%',
    completed: '100%',
  };
  
  return progressMap[status] || '0%';
}

function renderProjectSteps(currentStatus: string) {
  const steps = [
    { key: 'pending', label: 'En attente' },
    { key: 'validated', label: 'Validé' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'delivered', label: 'Livré' },
    { key: 'completed', label: 'Terminé' },
  ];
  
  const statusOrder = steps.map(s => s.key);
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  return steps.map((step, index) => {
    const isCompleted = index <= currentIndex;
    const isCurrent = step.key === currentStatus;
    
    return (
      <div 
        key={step.key} 
        className={`flex items-center p-2 rounded-md ${isCurrent ? 'bg-[#EBF2FF]' : ''}`}
      >
        <div className={`h-5 w-5 flex items-center justify-center rounded-full mr-3 
          ${isCompleted ? 'bg-[#467FF7] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}
        >
          {isCompleted ? '✓' : index + 1}
        </div>
        <div className="flex-1">
          <p className={`text-[14px] font-medium ${isCurrent ? 'text-[#467FF7]' : ''}`}>
            {step.label}
          </p>
        </div>
        {isCurrent && (
          <ChevronRight className="h-4 w-4 text-[#467FF7]" />
        )}
      </div>
    );
  });
} 