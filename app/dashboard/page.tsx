"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Project, fetchProjects, fetchAllProjects, createProject } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Calendar, CheckCircle, Clock, X } from 'lucide-react'

// Type étendu pour inclure les relations
type ProjectWithRelations = Project & {
  services?: { title: string; category_id: number } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
}

// Dynamic import with preload functionality 
const ProjectCard = ({ project }: { project: ProjectWithRelations }) => {
  // Status labels
  const statusLabels = {
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

  return (
    <motion.div 
      className="card border border-gray-100 hover:shadow-md transition-shadow h-[180px] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-3">
          <h3 className="text-xl font-semibold tracking-snug line-clamp-1">{project.title}</h3>
          {project.services && (
            <p className="text-sm text-muted-foreground mt-1">
              Service: {project.services.title}
            </p>
          )}
        </div>
        <span
          className={`badge whitespace-nowrap inline-flex ${statusLabels[project.status].color} px-2 py-1 rounded-full text-xs`}
        >
          {statusLabels[project.status].label}
        </span>
      </div>
      <div className="mt-auto flex justify-between items-center pt-4">
        <span className="text-sm text-muted-foreground">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
        <div className="space-x-2">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button size="sm" variant="outline">Voir les détails</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Composant pour une étape du tutoriel
const TutorialStep = ({ 
  step, 
  title, 
  description, 
  onNext, 
  onClose,
  isLast
}: { 
  step: number; 
  title: string; 
  description: string; 
  onNext: () => void; 
  onClose: () => void;
  isLast: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Étape {step} sur 5</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Ignorer
          </Button>
          <Button onClick={onNext}>
            {isLast ? "Terminer" : "Suivant"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // État pour le tutoriel
  const [showTutorial, setShowTutorial] = useState<boolean>(false)
  const [tutorialStep, setTutorialStep] = useState<number>(1)
  
  // Paramètres de paiement réussi
  const paymentSuccess = searchParams.get('payment_success')
  const sessionId = searchParams.get('session_id')
  const serviceId = searchParams.get('service_id')
  const title = searchParams.get('title')
  const price = searchParams.get('price')
  
  // Vérifier si le tutoriel doit être affiché depuis l'URL
  const showTutorialParam = searchParams.get('showTutorial')
  
  // Status labels
  const statusLabels = {
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
  
  // Fonction pour charger les projets
  const loadProjects = async () => {
    if (user) {
      try {
        const fetchedProjects = isAdmin 
          ? await fetchAllProjects()
          : await fetchProjects(user.id);
        setProjects(fetchedProjects);
        
        // Si c'est la première connexion et qu'il n'y a pas de projets, afficher le tutoriel
        if (fetchedProjects.length === 0) {
          const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
          if (!hasSeenTutorial) {
            setShowTutorial(true)
            localStorage.setItem('hasSeenTutorial', 'true')
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Fonction pour passer à l'étape suivante du tutoriel
  const nextTutorialStep = () => {
    if (tutorialStep < 5) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
      // Nettoyer l'URL si le tutoriel a été ouvert depuis l'URL
      if (showTutorialParam) {
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }
  
  // Fonction pour fermer le tutoriel
  const closeTutorial = () => {
    setShowTutorial(false)
    // Nettoyer l'URL si le tutoriel a été ouvert depuis l'URL
    if (showTutorialParam) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }
  
  // Effet pour charger les projets
  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])
  
  // Effet pour afficher le tutoriel si le paramètre est présent dans l'URL
  useEffect(() => {
    if (showTutorialParam === 'true') {
      setTutorialStep(1)
      setShowTutorial(true)
    }
  }, [showTutorialParam])
  
  // Effet pour gérer la création de projet après un paiement réussi
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (paymentSuccess === 'true' && sessionId && serviceId && title && price && user && !isLoading) {
        try {
          const project = await createProject(
            user.id,
            serviceId,
            title,
            parseInt(price)
          )
          
          if (project) {
            // Afficher un toast de confirmation
            toast({
              title: "Paiement réussi !",
              description: `Votre projet "${title}" a été créé avec succès.`,
              duration: 5000,
            })
            
            // Recharger les projets
            loadProjects()
            
            // Nettoyer l'URL pour éviter de recréer le projet en cas de refresh
            const newUrl = window.location.pathname
            window.history.replaceState({}, document.title, newUrl)
          }
        } catch (err) {
          console.error('Erreur lors de la création du projet après paiement:', err)
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la création de votre projet.",
            variant: "destructive",
            duration: 5000,
          })
        }
      }
    }
    
    handlePaymentSuccess()
  }, [paymentSuccess, sessionId, serviceId, title, price, user, isLoading])

  // Les étapes du tutoriel
  const tutorialSteps = [
    {
      title: "Bienvenue sur Klyra Hub !",
      description: "Bienvenue sur votre plateforme Klyra ! Ce rapide tutoriel vous aidera à comprendre comment utiliser votre espace client."
    },
    {
      title: "Découvrez nos services",
      description: "Consultez notre marketplace pour découvrir tous les services proposés par Klyra. Vous pouvez filtrer par catégorie ou par prix pour trouver ce qui correspond à vos besoins."
    },
    {
      title: "Suivez vos projets",
      description: "Après un achat, vos projets apparaîtront sur cette page. Vous pourrez suivre leur avancement, consulter les livrables et échanger avec notre équipe."
    },
    {
      title: "Consultez votre historique d'achats",
      description: "Retrouvez l'ensemble de vos commandes, factures et transactions dans la section Historique d'achats accessible depuis le menu."
    },
    {
      title: "Personnalisez votre profil",
      description: "Accédez à votre profil pour modifier vos informations personnelles, préférences et paramètres de notification."
    }
  ]

  return (
    <div className="space-y-8">
      {showTutorial && (
        <TutorialStep
          step={tutorialStep}
          title={tutorialSteps[tutorialStep - 1].title}
          description={tutorialSteps[tutorialStep - 1].description}
          onNext={nextTutorialStep}
          onClose={closeTutorial}
          isLast={tutorialStep === 5}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">Dashboard</h1>
          {isAdmin && (
            <p className="text-sm text-muted-foreground mt-1">Mode administrateur - Tous les projets sont visibles</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard/marketplace">
            <Button>
              Explorer les services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-primary">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Vous n'avez pas encore de projets</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Explorez notre marketplace et découvrez nos services pour commencer votre premier projet avec Klyra.
          </p>
          <Link href="/dashboard/marketplace">
            <Button size="lg">
              Découvrir nos services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
} 