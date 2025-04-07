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
import { ArrowRight, Calendar, CheckCircle, Clock } from 'lucide-react'

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
      className="card hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold tracking-snug">{project.title}</h3>
          {project.services && (
            <p className="text-sm text-klyra-text-medium mt-1">
              Service: {project.services.title}
            </p>
          )}
        </div>
        <span
          className={`badge ${statusLabels[project.status].color}`}
        >
          {statusLabels[project.status].label}
        </span>
      </div>
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-klyra-text-light">
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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Paramètres de paiement réussi
  const paymentSuccess = searchParams.get('payment_success')
  const sessionId = searchParams.get('session_id')
  const serviceId = searchParams.get('service_id')
  const title = searchParams.get('title')
  const price = searchParams.get('price')
  
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
  
  // Effet pour charger les projets
  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])
  
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter">Dashboard</h1>
          {isAdmin && (
            <p className="text-sm text-klyra-text-medium mt-1">Mode administrateur - Tous les projets sont visibles</p>
          )}
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard/marketplace">
            <Button>
              Explorer les services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{isAdmin ? 'Tous les projets' : 'Vos projets'}</h2>
        <p className="text-muted-foreground">
          {isAdmin 
            ? 'Vue d\'ensemble de tous les projets Klyra'
            : 'Suivi de vos projets Klyra'
          }
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-klyra-50 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-klyra-50 rounded mb-2 w-2/4"></div>
              <div className="h-4 bg-klyra-50 rounded mb-6 w-1/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-klyra-50 rounded w-1/4"></div>
                <div className="h-8 bg-klyra-50 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucun projet pour le moment</CardTitle>
            <CardDescription>
              Commencez votre premier projet en explorant notre marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-klyra-text-medium">
              Découvrez notre gamme de services professionnels adaptés à vos besoins.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/marketplace">
              <Button>
                Explorer les services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Informations importantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-klyra" />
                Délais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-klyra-text-medium">
                Nos délais de livraison sont calculés en jours ouvrés et commencent une fois votre projet validé par notre équipe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-klyra" />
                Suivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-klyra-text-medium">
                Vous pouvez suivre l'avancement de vos projets en temps réel et interagir avec notre équipe directement depuis votre dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-klyra" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-klyra-text-medium">
                Nous travaillons jusqu'à votre satisfaction complète, avec des révisions illimitées selon les termes spécifiés dans chaque service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 