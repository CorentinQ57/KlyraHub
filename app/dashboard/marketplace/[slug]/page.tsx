"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { createProject, getServiceBySlug, type Service } from '@/lib/supabase'
import { motion } from 'framer-motion'

// This would come from Supabase in the real implementation
const services = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000", // Landing Page
    title: "Landing Page",
    slug: "landing-page",
    description: "Une page de conversion optimisée pour transformer vos visiteurs en clients",
    long_description: "Notre service de Landing Page est spécialement conçu pour maximiser vos conversions. Nous créons une page unique, optimisée pour le SEO, avec un design élégant et une UX pensée pour convertir vos visiteurs en clients ou prospects. Chaque élément est stratégiquement placé pour guider l'utilisateur vers votre objectif principal.",
    icon: "🚀",
    price: 1490,
    category: "Web",
    duration: "2 semaines",
    features: [
      "Design responsive adapté à tous les appareils",
      "Optimisation SEO pour un meilleur référencement",
      "Formulaires de capture de leads intégrés",
      "Analytics pour suivre les performances",
      "Intégration avec vos outils marketing",
      "Optimisation de la vitesse de chargement",
      "Tests A/B pour maximiser les conversions",
      "Support technique de 30 jours inclus"
    ],
    process: [
      "Analyse de vos besoins et objectifs",
      "Wireframing et maquettage",
      "Design et développement",
      "Tests et optimisations",
      "Mise en ligne et formation"
    ],
    testimonial: {
      name: "Sophie Martin",
      company: "TechStart SAS",
      text: "Notre landing page convertit désormais à 7.2% contre 2.1% auparavant. L'équipe Klyra a parfaitement compris nos objectifs et a livré dans les délais."
    },
    relatedServices: ["Audit UX/UI", "Kit Réseaux Sociaux"],
    images: [
      "/images/landing-example1.jpg",
      "/images/landing-example2.jpg"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // Branding Complet
    title: "Branding Complet",
    slug: "branding-complet",
    description: "Identité visuelle complète avec logo, charte graphique et éléments de marque",
    long_description: "Notre service de Branding Complet vous aide à créer une identité de marque cohérente et mémorable qui résonne avec votre public cible. Nous développons tous les éléments visuels nécessaires pour établir une présence de marque forte sur tous les supports, en ligne et hors ligne.",
    icon: "✨",
    price: 2490,
    category: "Branding",
    duration: "3 semaines",
    features: [
      "Logo principal et variantes en format vectoriel",
      "Charte graphique complète",
      "Palette de couleurs et typographie",
      "Éléments graphiques secondaires",
      "Templates pour documents commerciaux",
      "Guide d'utilisation de la marque",
      "Fichiers sources livrés dans tous les formats",
      "Révisions illimitées jusqu'à validation"
    ],
    process: [
      "Audit de marque et analyse concurrentielle",
      "Exploration conceptuelle",
      "Développement du design",
      "Finalisation et déclinaisons",
      "Livraison des fichiers et guide d'utilisation"
    ],
    testimonial: {
      name: "Thomas Dubois",
      company: "InnovateLab",
      text: "Notre nouvelle identité de marque a été unanimement saluée par nos clients et partenaires. Un investissement qui a vraiment transformé la perception de notre entreprise."
    },
    relatedServices: ["Kit Réseaux Sociaux", "Landing Page"],
    images: [
      "/images/branding-example1.jpg",
      "/images/branding-example2.jpg"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", // Web App
    title: "Web App",
    slug: "web-app",
    description: "Application web sur mesure avec une expérience utilisateur optimale",
    long_description: "Notre service de Web App vous permet de développer une application web complète et sur mesure pour répondre précisément à vos besoins métier. Nous nous occupons de l'ensemble du processus, de la conception à la mise en production, en garantissant une expérience utilisateur optimale et des performances techniques exemplaires.",
    icon: "💻",
    price: 4990,
    category: "Web",
    duration: "6 semaines",
    features: [
      "Design UI/UX personnalisé et responsive",
      "Développement frontend et backend",
      "Fonctionnalités avancées sur mesure",
      "Panel d'administration complet",
      "Formation à l'utilisation incluse",
      "Sécurité et protection des données",
      "Mise en place d'un système d'analytics",
      "90 jours de support technique inclus"
    ],
    process: [
      "Analyse des besoins et spécifications",
      "Architecture technique et wireframes",
      "Design d'interface et prototype",
      "Développement et intégration",
      "Tests et déploiement"
    ],
    testimonial: {
      name: "Marie Lambert",
      company: "DataSphere",
      text: "Klyra a développé une application web qui a transformé nos processus internes. Ce qui nous prenait des heures se fait maintenant en quelques clics."
    },
    relatedServices: ["Refonte Site Web", "Audit UX/UI"],
    images: [
      "/images/webapp-example1.jpg",
      "/images/webapp-example2.jpg"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003", // Audit UX/UI
    title: "Audit UX/UI",
    slug: "audit-ux-ui",
    description: "Analyse complète de votre interface et parcours utilisateur avec recommandations",
    long_description: "Notre Audit UX/UI examine en profondeur votre interface utilisateur actuelle et les parcours utilisateurs pour identifier les frictions, les opportunités d'amélioration et les meilleures pratiques à mettre en œuvre. Vous recevrez un rapport détaillé avec des recommandations concrètes et priorisées.",
    icon: "🔍",
    price: 990,
    category: "Conseil",
    duration: "1 semaine",
    features: [
      "Analyse heuristique complète",
      "Évaluation des parcours utilisateurs",
      "Benchmark concurrentiel",
      "Identification des points d'amélioration",
      "Recommandations priorisées",
      "Guide de bonnes pratiques",
      "Rapport détaillé avec captures d'écran",
      "Session de présentation des résultats"
    ],
    process: [
      "Collecte d'informations sur votre produit",
      "Analyse des interfaces et parcours",
      "Évaluation comparative",
      "Rédaction du rapport",
      "Présentation des résultats"
    ],
    testimonial: {
      name: "Paul Durand",
      company: "FinTech Solutions",
      text: "L'audit a révélé des problèmes que nous n'avions jamais identifiés et qui impactaient notre taux de conversion. Les recommandations étaient claires et nous avons pu les mettre en œuvre rapidement."
    },
    relatedServices: ["Refonte Site Web", "Web App"],
    images: [
      "/images/audit-example1.jpg",
      "/images/audit-example2.jpg"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004", // Refonte Site Web
    title: "Refonte Site Web",
    slug: "refonte-site-web",
    description: "Modernisation complète de votre site web existant",
    long_description: "Notre service de Refonte Site Web transforme votre présence en ligne avec un design contemporain, une expérience utilisateur améliorée et des performances optimisées. Nous préservons le contenu et les fonctionnalités essentielles tout en repensant l'architecture, le design et les parcours utilisateurs.",
    icon: "🔄",
    price: 2990,
    category: "Web",
    duration: "4 semaines",
    features: [
      "Design moderne et responsive",
      "Optimisation des performances",
      "Migration de contenu",
      "SEO amélioré",
      "Intégration CMS facile à gérer",
      "Compatibilité tous navigateurs",
      "Optimisation de la conversion",
      "Formation à l'administration incluse"
    ],
    process: [
      "Audit du site existant",
      "Planification de l'architecture",
      "Design et développement",
      "Migration de contenu",
      "Tests et lancement"
    ],
    testimonial: {
      name: "Julie Moreau",
      company: "EcoConsult",
      text: "Notre site web ressemble enfin à ce que nous sommes aujourd'hui. La refonte a amélioré notre image de marque et a eu un impact direct sur nos demandes de devis."
    },
    relatedServices: ["Landing Page", "Branding Complet"],
    images: [
      "/images/refonte-example1.jpg",
      "/images/refonte-example2.jpg"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005", // Kit Réseaux Sociaux
    title: "Kit Réseaux Sociaux",
    slug: "kit-reseaux-sociaux",
    description: "Ensemble de templates et visuels pour vos réseaux sociaux",
    long_description: "Notre Kit Réseaux Sociaux vous fournit tous les templates et éléments visuels nécessaires pour créer une présence cohérente et professionnelle sur les réseaux sociaux. Personnalisés selon votre identité visuelle, ces modèles vous permettent de publier régulièrement du contenu de qualité sans effort de design.",
    icon: "📱",
    price: 990,
    category: "Social Media",
    duration: "2 semaines",
    features: [
      "Templates Instagram (posts et stories)",
      "Couvertures et bannières Facebook",
      "Visuels LinkedIn optimisés",
      "Bannières Twitter / X",
      "Éléments graphiques réutilisables",
      "Pictogrammes et icônes personnalisés",
      "Guide d'utilisation des templates",
      "Fichiers sources modifiables (Photoshop/Figma)"
    ],
    process: [
      "Analyse de votre identité visuelle",
      "Conception des modèles",
      "Création des éléments graphiques",
      "Adaptation aux différentes plateformes",
      "Livraison et formation"
    ],
    testimonial: {
      name: "Clara Lefebvre",
      company: "Style & Design",
      text: "Le kit nous a permis d'avoir une présence cohérente sur tous nos réseaux sociaux. Nos taux d'engagement ont augmenté de 35% depuis que nous utilisons ces templates."
    },
    relatedServices: ["Branding Complet", "Landing Page"],
    images: [
      "/images/social-example1.jpg",
      "/images/social-example2.jpg"
    ]
  }
]

// Get service slug from related service name
const getSlugFromName = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

// Processus par défaut si non spécifié dans le service
const defaultProcess = [
  "Briefing",
  "Conception",
  "Développement",
  "Tests et validation",
  "Livraison"
]

// Fonction de création de slug identique à celle de la page marketplace
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

type Props = {
  params: {
    slug: string
  }
}

export default function ServicePage({ params }: Props) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const { slug } = params
  
  const [service, setService] = useState<Service | null>(null)
  const [isLoadingService, setIsLoadingService] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const loadService = async () => {
      const serviceData = await getServiceBySlug(slug)
      setService(serviceData)
      setIsLoadingService(false)
      
      // Si le service est trouvé mais que le slug ne correspond pas au nom actuel,
      // rediriger vers la bonne URL avec le slug mis à jour
      if (serviceData && getSlug(serviceData.name) !== slug) {
        const correctSlug = getSlug(serviceData.name)
        console.log(`Redirection vers le slug correct: ${correctSlug}`)
        router.replace(`/dashboard/marketplace/${correctSlug}`)
      }
    }
    loadService()
  }, [slug, router])
  
  const handleBuyNow = async () => {
    if (!user || !service) return
    
    try {
      setIsProcessingPayment(true)
      setPaymentError(null)
      
      // Créer le projet dans Supabase
      const project = await createProject(
        user.id,
        service.id,
        service.name,
        service.price
      )

      toast({
        title: "Projet créé avec succès !",
        description: "Vous pouvez maintenant suivre l'avancement de votre projet dans votre dashboard.",
        duration: 5000,
      })

      // Redirection vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Erreur:', error)
      const errorMessage = error?.message || 'Une erreur est survenue lors de la création du projet.'
      setPaymentError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        duration: 5000,
        variant: "destructive"
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }
  
  if (isLoading || isLoadingService) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (!service) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6 md:gap-10">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-klyra">Klyra</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard/marketplace')}>
                Retour au marketplace
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              Le service que vous recherchez n'est plus disponible ou a été renommé.
            </p>
            <Button onClick={() => router.push('/dashboard/marketplace')}>
              Voir tous les services
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-klyra">Klyra</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-klyra">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="text-sm font-medium transition-colors hover:text-klyra">
                Profil
              </Link>
              <Link href="/dashboard/purchases" className="text-sm font-medium transition-colors hover:text-klyra">
                Historique d'achats
              </Link>
              <Link href="/dashboard/marketplace" className="text-sm font-medium transition-colors hover:text-klyra">
                Marketplace
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/marketplace')}>
              Retour aux services
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="lg:w-2/3">
              <div className="space-y-8">
                <Link 
                  href="/dashboard/marketplace" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Retour aux services
                </Link>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{service.icon || '📋'}</div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
                      <p className="text-muted-foreground">{service.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">{service.icon || '📋'}</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Description</h2>
                  <p className="text-muted-foreground">{service.long_description || service.description}</p>
                  
                  {service.features && service.features.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold">Ce qui est inclus</h3>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h3 className="text-xl font-bold">Notre processus</h3>
                  <div className="flex flex-col space-y-10 py-4 px-2">
                    {(service.phases || defaultProcess).map((step, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-start gap-4 relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.2 }}
                        viewport={{ once: true, margin: "-100px" }}
                      >
                        {i < (service.phases || defaultProcess).length - 1 && (
                          <motion.div 
                            className="absolute left-4 top-8 w-0.5 bg-klyra/20" 
                            style={{ height: "calc(100% + 10px)" }}
                            initial={{ height: 0 }}
                            whileInView={{ height: "calc(100% + 10px)" }}
                            transition={{ duration: 0.5, delay: i * 0.2 + 0.3 }}
                            viewport={{ once: true, margin: "-100px" }}
                          />
                        )}
                        
                        <motion.div 
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-klyra text-white shrink-0 z-10"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 15, 
                            delay: i * 0.2 + 0.1 
                          }}
                          viewport={{ once: true, margin: "-100px" }}
                        >
                          {i + 1}
                        </motion.div>
                        
                        <motion.div 
                          className="bg-klyra-50 p-4 rounded-lg shadow-sm border border-klyra/10 flex-1"
                          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <h4 className="font-medium text-base">{step}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Cette étape est essentielle dans notre processus pour garantir un résultat de qualité.
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 space-y-6">
              <div className="rounded-lg border bg-background p-6 shadow-sm sticky top-24">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">À partir de</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{service.price}€</span>
                        <span className="text-muted-foreground">HT</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Délai de livraison: {service.duration} jours</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-klyra hover:bg-klyra/90"
                      onClick={handleBuyNow}
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? 'Traitement en cours...' : 'Acheter maintenant'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      Demander un devis personnalisé
                    </Button>
                  </div>
                  
                  {paymentError && (
                    <div className="text-red-500 text-sm mt-2">
                      {paymentError}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    En achetant ce service, vous acceptez nos <Link href="/terms" className="underline hover:text-klyra">conditions d'utilisation</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 