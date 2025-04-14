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
import { ArrowRight, Calendar, CheckCircle, Clock, X, Store, ShoppingCart, Bell, Activity, Award, CreditCard, MessageSquare, Package, PenTool, Layout, Code, LineChart, FileText, FolderPlus } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import VideoWalkthrough from '@/components/VideoWalkthrough'
import Image from 'next/image'
import { AuroraBackground } from "@/components/ui/aurora-background"
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { useSafeFetch } from '@/lib/hooks/useSafeFetch'

// Type étendu pour inclure les relations
type ProjectWithRelations = Project & {
  services?: {
    name: string;
    category_id: string;
    image_url?: string;
    description?: string;
    category?: {
      id: string;
      name: string;
      image_url?: string;
    };
  } | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
  category_image_url?: string;
}

// Types additionnels
type Notification = {
  id: string
  title: string
  message: string
  type: 'comment' | 'deliverable' | 'validation' | 'system'
  createdAt: Date
  read: boolean
}

type ProjectStats = {
  totalProjects: number
  completedProjects: number
  activeProjects: number
  totalInvestment: number
}

// Mapping des icônes par catégorie
const categoryIcons: Record<string, JSX.Element> = {
  branding: <PenTool className="h-6 w-6" />,
  web_design: <Layout className="h-6 w-6" />,
  development: <Code className="h-6 w-6" />,
  strategy: <LineChart className="h-6 w-6" />,
  default: <Store className="h-6 w-6" />
};

// Mapping des images par catégorie
const categoryImages: Record<string, string> = {
  branding: "/images/categories/branding.jpg",
  web_design: "/images/categories/web-design.jpg",
  development: "/images/categories/development.jpg",
  strategy: "/images/categories/strategy.jpg",
  default: "/images/categories/default.jpg"
};

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

  // Utiliser l'image du service ou de la catégorie
  const serviceImage = project.services?.image_url;
  const categoryImage = project.category_image_url || project.services?.category?.image_url;
  const displayImage = serviceImage || categoryImage || categoryImages.default;

  // Utiliser l'icône de la catégorie
  const categoryId = project.services?.category_id || 'default';
  const categoryIcon = categoryIcons[categoryId] || categoryIcons.default;

  // Récupération plus robuste du nom de la catégorie - Priorité améliorée
  const getCategoryName = () => {
    // Cas 1: Accès via la structure correcte - Priorité maximale
    if (project.services?.category?.name) {
      return project.services.category.name;
    }
    
    // Cas 2: Utilisation des ID connus avec traduction explicite
    if (project.services?.category_id) {
      const categoryKey = project.services.category_id.toLowerCase();
      // Map des IDs connus vers des noms plus descriptifs
      return categoryKey === "1b041ce2-1f9b-466f-8aa4-b94fec7d94ab" ? "Développement Web" :
             categoryKey === "ba8f9878-d327-4b2d-8be5-ae95df23e1a0" ? "Branding" :
             categoryKey === "7227a841-69e8-48bb-85fd-d65d49618245" ? "UI UX Design" :
             categoryKey === "53b49d36-18c7-467f-89fc-cd78331dc0d7" ? "Social Media" : 
             "Catégorie";
    }
    
    // Cas 3: Si on a le nom du service, l'utiliser comme fallback
    if (project.services?.name) {
      return project.services.name;
    }
    
    // Cas par défaut
    return "Catégorie";
  };

  // Récupérer le nom de la catégorie une seule fois
  const categoryName = getCategoryName();

  return (
    <motion.div 
      className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#F8FAFC] p-2">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Image
            src={displayImage}
            alt={project.services?.name || "Image du projet"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          <div className="absolute top-3 right-3">
            <span className={`whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusLabels[project.status].color}`}>
              {statusLabels[project.status].label}
            </span>
          </div>
          
          {/* Ajout du badge de catégorie en haut à gauche de l'image */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-[#467FF7] shadow-sm">
              {categoryIcon}
              <span className="ml-1.5 font-medium">{categoryName}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-[16px] font-semibold mb-1 line-clamp-1">{project.title}</h3>
        <p className="text-[13px] text-[#64748B] mb-4 line-clamp-2">
          {project.description || "Description du projet"}
        </p>

        <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
          <span className="text-[13px] text-[#64748B] flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button size="sm" variant="outline" className="text-xs h-8">
              Voir le projet
            </Button>
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
  isLast,
  icon
}: { 
  step: number; 
  title: string; 
  description: string; 
  onNext: () => void; 
  onClose: () => void;
  isLast: boolean;
  icon: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md"
              >
                <div className="text-primary">
                  {icon}
                </div>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-white/80 hover:bg-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-2xl">{title}</CardTitle>
              <div className="flex mt-2 items-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-2 rounded-full ${i < step ? 'bg-primary' : 'bg-primary/20'} ${i === step - 1 ? 'w-6' : 'w-2'}`}
                      initial={i === step - 1 ? { width: 8 } : {}}
                      animate={i === step - 1 ? { width: 24 } : {}}
                      transition={{ delay: 0.5 }}
                    />
                  ))}
                </div>
                <p className="text-xs ml-3 text-gray-600">Étape {step}/5</p>
              </div>
            </motion.div>
          </div>
          <CardContent className="p-6">
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>
          </CardContent>
          <CardFooter className="p-4 bg-gray-50 flex justify-between">
            <Button variant="ghost" onClick={onClose} size="sm">
              Ignorer le tutoriel
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={onNext} className="font-medium" size="sm">
                {isLast ? "Terminer" : "Suivant"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Nouveau composant pour les statistiques
const StatsOverview = ({ stats }: { stats: ProjectStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projets Totaux</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeProjects} projets actifs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projets Complétés</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedProjects}</div>
          <Progress value={(stats.completedProjects / stats.totalProjects) * 100} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges Débloqués</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            Prochain badge dans 2 projets
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investissement Total</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvestment}€</div>
          <p className="text-xs text-muted-foreground">
            Dernière facture il y a 3 jours
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Nouveau composant pour les notifications
const NotificationsPanel = ({ notifications }: { notifications: Notification[] }) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Notifications Récentes</CardTitle>
        <CardDescription>Vos dernières activités et mises à jour</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-start space-x-4 mb-4 p-3 rounded-lg hover:bg-accent">
              <div className={`rounded-full p-2 ${
                notif.type === 'comment' ? 'bg-blue-100' :
                notif.type === 'deliverable' ? 'bg-green-100' :
                notif.type === 'validation' ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {notif.type === 'comment' ? <MessageSquare className="h-4 w-4" /> :
                 notif.type === 'deliverable' ? <Package className="h-4 w-4" /> :
                 notif.type === 'validation' ? <CheckCircle className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{notif.title}</h4>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const { user, isAdmin, reloadAuthState } = useAuth()
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
  
  // Vérifier si le tutoriel doit être affiché depuis l'URL (bouton Aide)
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
  
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    totalInvestment: 0
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Use our safe fetch hook for projects
  const { 
    data: fetchedProjects, 
    isLoading: projectsLoading,
    refetch: refetchProjects
  } = useSafeFetch<ProjectWithRelations[]>(
    async () => {
      // Get user ID from user context
      if (!user?.id) {
        console.log("No user ID available, cannot fetch projects");
        return [];
      }
      
      // Choose the right fetch function based on admin status
      console.log("Fetching projects for user:", user.id, "isAdmin:", isAdmin);
      try {
        if (isAdmin) {
          const allProjects = await fetchAllProjects();
          console.log(`Fetched ${allProjects.length} projects as admin`);
          return allProjects;
        } else {
          const userProjects = await fetchProjects(user.id);
          console.log(`Fetched ${userProjects.length} projects for user`);
          return userProjects;
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        return [];
      }
    },
    [isAdmin, user?.id] // Re-fetch when admin status or user ID changes
  )
  
  // Update projects state when fetchedProjects changes
  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects)
      
      // Debugging logs
      if (fetchedProjects.length > 0) {
        console.log('First project loaded successfully');
      }
      
      // Check for first login to show tutorial
      if (typeof window !== 'undefined') {
        const isFirstLogin = localStorage.getItem('hasCompletedOnboarding') === null;
        
        if (isFirstLogin) {
          console.log("Première connexion détectée, affichage du tutoriel d'onboarding");
          setShowTutorial(true);
        }
      }
    }
  }, [fetchedProjects])
  
  // Synchronize loading states
  useEffect(() => {
    setIsLoading(projectsLoading)
  }, [projectsLoading])
  
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
            refetchProjects()
            
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
  }, [paymentSuccess, sessionId, serviceId, title, price, user, isLoading, refetchProjects])

  // Les étapes du tutoriel
  const tutorialSteps = [
    {
      title: "Hey ! Bienvenue sur Klyra Hub 👋",
      description: "Super content de te voir ici ! Je suis là pour te guider dans tes premiers pas sur la plateforme Klyra. Prêt(e) pour un petit tour ? C'est parti !",
      icon: <motion.div 
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              👋
            </motion.div>
    },
    {
      title: "Découvre notre marketplace 🛍️",
      description: "Ici, tu trouveras tous nos services design et web. Tu peux filtrer par catégorie ou prix pour trouver exactement ce qu'il te faut. N'hésite pas à explorer !",
      icon: <Store className="h-6 w-6" />
    },
    {
      title: "Tes projets en direct 🚀",
      description: "Après ton premier achat, tes projets apparaîtront ici. Tu pourras suivre leur avancement, échanger avec notre équipe et voir les livrables... Tout ça au même endroit !",
      icon: <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🚀
            </motion.div>
    },
    {
      title: "Ton historique d'achats 📝",
      description: "Toutes tes commandes, factures et transactions sont conservées dans la section 'Mes achats'. Pratique pour garder une trace de tout, non ?",
      icon: <ShoppingCart className="h-6 w-6" />
    },
    {
      title: "C'est toi qui décides 🎯",
      description: "N'oublie pas de personnaliser ton profil ! Tu peux modifier tes infos, préférences et paramètres quand tu veux. C'est ton espace, fais-toi plaisir !",
      icon: <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🎯
            </motion.div>
    }
  ]

  // Fonction pour calculer les statistiques
  const calculateStats = (projects: ProjectWithRelations[]) => {
    const completed = projects.filter(p => p.status === 'completed').length
    const active = projects.filter(p => p.status !== 'completed').length
    // TODO: Calculer l'investissement total depuis les services
    setStats({
      totalProjects: projects.length,
      completedProjects: completed,
      activeProjects: active,
      totalInvestment: 0 // À implémenter
    })
  }

  // Safe fetch for notifications
  const loadNotifications = async () => {
    // TODO: Implémenter la récupération des notifications depuis Supabase
    // Pour l'instant, on utilise des données de test
    setNotifications([
      {
        id: '1',
        title: 'Nouveau commentaire',
        message: 'L\'équipe a commenté sur votre projet',
        type: 'comment',
        createdAt: new Date(),
        read: false
      },
      // Add other test notifications...
    ])
  }

  useEffect(() => {
    if (projects.length > 0) {
      calculateStats(projects)
    }
    loadNotifications()
  }, [projects])

  // Tutorial functions
  const nextTutorialStep = () => {
    if (tutorialStep < 5) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
      // Marquer le tutoriel comme terminé dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasCompletedOnboarding', 'true')
      }
      // Nettoyer l'URL si le tutoriel a été ouvert depuis l'URL
      if (showTutorialParam) {
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }
  
  const closeTutorial = () => {
    setShowTutorial(false)
    // Marquer le tutoriel comme terminé même si fermé prématurément
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasCompletedOnboarding', 'true')
    }
    // Nettoyer l'URL si le tutoriel a été ouvert depuis l'URL
    if (showTutorialParam) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }

  // Effet pour gérer les changements de statut utilisateur
  useEffect(() => {
    // Si l'utilisateur vient d'être connecté, forcer un rafraîchissement des projets
    if (user && user.id && !projectsLoading) {
      console.log("👤 User state changed, ensuring projects are loaded:", user.email);
      
      // On vérifie que les projets sont bien chargés
      if (!fetchedProjects || fetchedProjects.length === 0) {
        console.log("🔄 No projects loaded yet, triggering refresh");
        refetchProjects();
      }
    }
  }, [user, projectsLoading, fetchedProjects, refetchProjects]);

  // Vérifier explicitement que la session est valide après un changement de route
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Vérifier que la session existe
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error checking session:", error);
          return;
        }
        
        if (!data.session) {
          console.log("⚠️ No valid session found, reloading auth state");
          await reloadAuthState();
        } else if (!fetchedProjects || fetchedProjects.length === 0) {
          // Si on a une session mais pas de projets, recharger les projets
          console.log("✅ Valid session found but no projects, reloading projects");
          refetchProjects();
        } else {
          console.log("✅ Valid session with projects already loaded");
        }
      } catch (err) {
        console.error("❌ Error in checkSession:", err);
      }
    };
    
    // Exécuter la vérification au montage du composant
    checkSession();
  }, [reloadAuthState, fetchedProjects, refetchProjects]);

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader 
          title="Tableau de bord" 
          description={`Bienvenue ${user?.user_metadata?.full_name || 'sur votre espace client'}`}
        >
          <Link href="/dashboard/marketplace">
            <Button>
              <Store className="mr-2 h-4 w-4" /> Explorer les services
            </Button>
          </Link>
        </PageHeader>

        <PageSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContentCard>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium text-[#64748B]">Projets Totaux</span>
                  <Store className="h-4 w-4 text-[#64748B]" />
                </div>
                <span className="text-2xl font-bold">{stats.totalProjects}</span>
                <span className="text-xs text-[#64748B] mt-1">
                  {stats.activeProjects} projets actifs
                </span>
              </div>
            </ContentCard>
            
            <ContentCard>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium text-[#64748B]">Projets Complétés</span>
                  <CheckCircle className="h-4 w-4 text-[#64748B]" />
                </div>
                <span className="text-2xl font-bold">{stats.completedProjects}</span>
                <Progress value={(stats.completedProjects / stats.totalProjects) * 100} className="h-2 mt-2" />
              </div>
            </ContentCard>
            
            <ContentCard>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium text-[#64748B]">Badges Débloqués</span>
                  <Award className="h-4 w-4 text-[#64748B]" />
                </div>
                <span className="text-2xl font-bold">3</span>
                <span className="text-xs text-[#64748B] mt-1">
                  Prochain badge dans 2 projets
                </span>
              </div>
            </ContentCard>
            
            <ContentCard>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium text-[#64748B]">Investissement Total</span>
                  <CreditCard className="h-4 w-4 text-[#64748B]" />
                </div>
                <span className="text-2xl font-bold">{stats.totalInvestment}€</span>
                <span className="text-xs text-[#64748B] mt-1">
                  Dernière facture il y a 3 jours
                </span>
              </div>
            </ContentCard>
          </div>
        </PageSection>

        <PageSection>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="mt-0">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <EmptyState
                    title="Aucun projet pour le moment"
                    description="Vous n'avez pas encore de projets. Explorez notre marketplace pour découvrir nos services et créer votre premier projet."
                    icons={[FolderPlus, FileText, PenTool]}
                    action={{
                      label: "Créer un projet",
                      onClick: () => router.push('/dashboard/marketplace')
                    }}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ContentCard>
                    <h3 className="text-[18px] font-semibold mb-3">Notifications Récentes</h3>
                    <p className="text-[13px] text-[#64748B] mb-4">Vos dernières activités et mises à jour</p>
                    
                    <ScrollArea className="h-[300px] w-full pr-4">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start space-x-4 mb-4 p-3 rounded-lg hover:bg-[#F8FAFC]">
                          <div className={`rounded-full p-2 ${
                            notif.type === 'comment' ? 'bg-blue-100' :
                            notif.type === 'deliverable' ? 'bg-green-100' :
                            notif.type === 'validation' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            {notif.type === 'comment' ? <MessageSquare className="h-4 w-4" /> :
                            notif.type === 'deliverable' ? <Package className="h-4 w-4" /> :
                            notif.type === 'validation' ? <CheckCircle className="h-4 w-4" /> :
                            <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[14px] font-medium">{notif.title}</h4>
                            <p className="text-[13px] text-[#64748B]">{notif.message}</p>
                            <span className="text-xs text-[#64748B]">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-[#467FF7]" />
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </ContentCard>
                </div>
                <div>
                  <ContentCard>
                    <h3 className="text-[18px] font-semibold mb-3">Activité récente</h3>
                    <p className="text-[13px] text-[#64748B]">Votre activité sur la plateforme</p>
                    {/* Contenu à ajouter */}
                  </ContentCard>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PageSection>

        {showTutorial && (
          <TutorialStep
            step={tutorialStep}
            title={tutorialSteps[tutorialStep - 1].title}
            description={tutorialSteps[tutorialStep - 1].description}
            onNext={nextTutorialStep}
            onClose={closeTutorial}
            isLast={tutorialStep === 5}
            icon={tutorialSteps[tutorialStep - 1].icon}
          />
        )}
      </PageContainer>
      
      {/* Ajout du composant VideoWalkthrough */}
      <VideoWalkthrough 
        videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
        videoTitle="Découvrir Klyra Hub en 2 minutes"
      />
    </AuroraBackground>
  )
} 