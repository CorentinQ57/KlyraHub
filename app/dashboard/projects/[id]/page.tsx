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
              icon,
              phases
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
    
    // Normaliser la phase actuelle si elle existe
    if (project.current_phase) {
      // Stocker la phase actuelle normalisée pour la comparaison ultérieure
      project.normalized_phase = project.current_phase.toLowerCase().replace(/\s+/g, '_');
      console.log('Phase actuelle normalisée:', project.normalized_phase);
    }
    
    // Extraire et normaliser les phases du service si elles existent
    let servicePhasesArray: string[] = [];
    
    if (project.services?.phases) {
      // Inspecter la structure des phases brutes
      console.log('Phases du service (brut):', project.services.phases);
      
      // Si phases est une chaîne JSON, essayer de la parser
      if (typeof project.services.phases === 'string') {
        try {
          servicePhasesArray = JSON.parse(project.services.phases as string);
          console.log('Phases du service (parsées depuis JSON):', servicePhasesArray);
        } catch (e) {
          console.error('Erreur de parsing des phases:', e);
          // Si le parsing échoue, tenter de diviser la chaîne par virgules
          servicePhasesArray = (project.services.phases as string).split(',').map((p: string) => p.trim());
          console.log('Phases du service (divisées par virgules):', servicePhasesArray);
        }
      } else if (Array.isArray(project.services.phases)) {
        // Si c'est déjà un tableau, l'utiliser directement
        servicePhasesArray = project.services.phases;
        console.log('Phases du service (déjà en tableau):', servicePhasesArray);
      }
    }
    
    // Si nous avons extrait des phases valides, les utiliser
    if (servicePhasesArray && servicePhasesArray.length > 0) {
      console.log('Phases du service trouvées:', servicePhasesArray);
      
      const phases = servicePhasesArray.map(phase => {
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
      { key: 'design_et_developpement', label: 'Design et développement' },
      { key: 'revisions', label: 'Révisions' },
      { key: 'finalisation', label: 'Finalisation' }
    ];
    
    console.log('Utilisation des phases par défaut:', defaultPhases.map(p => p.key));
    return defaultPhases;
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
                  <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    {project.current_phase || 'Démarrage'} 
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
            
              <div className="space-y-4">
                {getProjectPhases(project).map((phase, index) => {
                  const normalizedCurrentPhase = (project.current_phase || '').toLowerCase().replace(/\s+/g, '_');
                  const normalizedPhaseKey = phase.key.toLowerCase().replace(/\s+/g, '_');
                  
                  // Vérifier si c'est la phase actuelle par correspondance exacte ou partielle
                  let isCurrentPhase = normalizedCurrentPhase === normalizedPhaseKey;
                  
                  // Si pas de correspondance exacte, vérifier si le nom de la phase actuelle contient le nom de cette phase
                  // ou si le label de cette phase est contenu dans la phase actuelle
                  if (!isCurrentPhase && project.current_phase) {
                    isCurrentPhase = project.current_phase.toLowerCase().includes(phase.label.toLowerCase()) ||
                                     phase.label.toLowerCase().includes(project.current_phase.toLowerCase());
                    
                    // Log de débogage pour cette vérification spécifique
                    console.log(`Vérification de correspondance pour "${phase.label}": 
                                 Phase actuelle: "${project.current_phase}", 
                                 Est inclus dans phase actuelle: ${project.current_phase.toLowerCase().includes(phase.label.toLowerCase())},
                                 Phase actuelle est incluse dans le label: ${phase.label.toLowerCase().includes(project.current_phase.toLowerCase())}`);
                  }
                  
                  // Déterminer l'index de la phase actuelle pour gérer les phases passées
                  const currentPhaseIndex = getProjectPhases(project).findIndex(p => {
                    const pKey = p.key.toLowerCase().replace(/\s+/g, '_');
                    const pLabel = p.label.toLowerCase();
                    const currentPhaseLower = (project.current_phase || '').toLowerCase();
                    
                    return pKey === normalizedCurrentPhase || 
                           (project.current_phase && (currentPhaseLower.includes(pLabel) || pLabel.includes(currentPhaseLower)));
                  });
                  
                  // Une phase est passée si son index est inférieur à celui de la phase actuelle
                  const isPastPhase = currentPhaseIndex > -1 && index < currentPhaseIndex;
                  
                  // Ajouter un log de débogage pour cette phase spécifique
                  console.log(`Phase ${phase.label} (${phase.key}): isCurrentPhase=${isCurrentPhase}, isPastPhase=${isPastPhase}, index=${index}, currentPhaseIndex=${currentPhaseIndex}`);
                  
                  return (
                    <div 
                      key={phase.key}
                      className={`relative flex items-start p-4 rounded-md border-2 ${
                        isCurrentPhase ? 'border-blue-600 bg-blue-50' : 
                          isPastPhase ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full mr-3 text-lg
                        ${isCurrentPhase ? 'bg-blue-600 text-white font-bold' : 
                          isPastPhase ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                      >
                        {isPastPhase ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-[17px] font-medium ${
                          isCurrentPhase ? 'text-blue-700' : 
                            isPastPhase ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {phase.label}
                        </h4>
                        <p className={`text-[14px] mt-1 ${
                          isCurrentPhase ? 'text-blue-600 font-medium' : 
                            isPastPhase ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {isCurrentPhase ? "Phase en cours" : 
                            isPastPhase ? "Phase terminée" : "Phase à venir"}
                        </p>
                      </div>
                      {isCurrentPhase && (
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
                })}
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