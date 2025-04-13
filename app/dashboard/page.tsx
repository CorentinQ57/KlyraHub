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
import { Badge } from "@/components/ui/badge"
import { FolderOpenIcon, CalendarIcon, ChevronRightIcon } from "lucide-react"

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
  // Get the service category details
  const category = project.services?.category;
  
  // Status labels with color mapping
  const statusColors = {
    'in-progress': 'text-amber-500 bg-amber-50 border-amber-200',
    'completed': 'text-green-500 bg-green-50 border-green-200',
    'pending': 'text-blue-500 bg-blue-50 border-blue-200',
    'cancelled': 'text-gray-500 bg-gray-50 border-gray-200',
  };
  
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full overflow-hidden flex flex-col border-0 hover:shadow-md transition-all">
        {project.services?.image_url ? (
          <div className="relative w-full h-40">
            <Image
              src={project.services.image_url}
              alt={project.title}
              className="rounded-t-lg object-cover"
              fill
            />
            <div className="absolute top-3 right-3">
              <Badge className={`${statusColors[project.status as keyof typeof statusColors]} border`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center bg-gray-100 w-full h-40 rounded-t-lg">
            <FolderOpenIcon className="h-16 w-16 text-gray-400" />
            <div className="absolute top-3 right-3">
              <Badge className={`${statusColors[project.status as keyof typeof statusColors]} border`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </Badge>
            </div>
          </div>
        )}
        
        <CardContent className="flex flex-col flex-1 p-4">
          {/* Category displayed prominently at the top */}
          {category && (
            <div className="mb-2">
              <span className="category-label-primary">
                {category.image_url && (
                  <span className="mr-1">{categoryIcons[category.id] || categoryIcons.default}</span>
                )}
                {category.name}
              </span>
            </div>
          )}
          
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
          
          <div className="mt-auto pt-2 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
  
  // Fonction pour charger les projets
  const loadProjects = async () => {
    if (user) {
      try {
        const fetchedProjects = isAdmin 
          ? await fetchAllProjects()
          : await fetchProjects(user.id);
        
        // Débogage: afficher la structure d'un projet
        if (fetchedProjects.length > 0) {
          console.log('Structure du premier projet:', JSON.stringify(fetchedProjects[0], null, 2));
          
          // Vérifier spécifiquement la structure des services et de la catégorie
          const firstProject = fetchedProjects[0];
          console.log('Service du projet:', firstProject.services);
          console.log('Category_id:', firstProject.services?.category_id);
          console.log('Category:', firstProject.services?.category);
        }
        
        setProjects(fetchedProjects);
        
        // Vérifier si c'est la première connexion pour montrer le tutoriel
        if (typeof window !== 'undefined') {
          const isFirstLogin = localStorage.getItem('hasCompletedOnboarding') === null;
          
          // Si c'est la première connexion, afficher le tutoriel
          if (isFirstLogin) {
            console.log("Première connexion détectée, affichage du tutoriel d'onboarding");
            setShowTutorial(true);
            // Nous ne marquons pas encore le tutoriel comme terminé ici,
            // cela sera fait lorsque l'utilisateur termine le tutoriel
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
  
  // Fonction pour fermer le tutoriel
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

  // Charger les notifications
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
      // Ajouter d'autres notifications de test...
    ])
  }

  useEffect(() => {
    if (projects.length > 0) {
      calculateStats(projects)
    }
    loadNotifications()
  }, [projects])

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true}>
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