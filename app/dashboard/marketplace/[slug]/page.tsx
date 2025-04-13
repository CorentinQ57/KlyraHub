"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getServiceBySlug, type Service, createStripeSession } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'

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
      
      // Créer une session de paiement Stripe
      const stripeSession = await createStripeSession(
        user.id,
        service.id,
        service.name,
        service.price
      )
      
      if (stripeSession && stripeSession.url) {
        // Rediriger vers la page de paiement Stripe
        window.location.href = stripeSession.url
      } else {
        throw new Error('Impossible de créer une session de paiement')
      }

    } catch (error: any) {
      console.error('Erreur:', error)
      const errorMessage = error?.message || 'Une erreur est survenue lors de la création de la session de paiement.'
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
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (!service) {
    return (
      <div className="flex min-h-screen flex-col">
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
    <div>
      <main className="flex-1">
        <Tabs defaultValue="service">
          <TabsList className="hidden">
            <TabsTrigger value="service">{service?.name}</TabsTrigger>
          </TabsList>
          <TabsContent value="service">
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
                        <div className="text-4xl">{service?.icon || '📋'}</div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">{service?.name}</h1>
                          <p className="text-muted-foreground">{service?.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                        {service?.image_url ? (
                          <img 
                            src={service?.image_url} 
                            alt={service?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-6xl">{service?.icon || '📋'}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">Description</h2>
                      <p className="text-muted-foreground">{service?.long_description || service?.description}</p>
                      
                      {service?.features && service?.features.length > 0 && (
                        <>
                          <h3 className="text-xl font-bold">Ce qui est inclus</h3>
                          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {service?.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> {feature}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      <h3 className="text-xl font-bold">Notre processus</h3>
                      <div className="flex flex-col space-y-10 py-4 px-2">
                        {(service?.phases || defaultProcess).map((step, i) => (
                          <motion.div 
                            key={i} 
                            className="flex items-start gap-4 relative"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            viewport={{ once: true, margin: "-100px" }}
                          >
                            {i < (service?.phases || defaultProcess).length - 1 && (
                              <motion.div 
                                className="absolute left-4 top-8 w-0.5 bg-primary/20" 
                                style={{ height: "calc(100% + 10px)" }}
                                initial={{ height: 0 }}
                                whileInView={{ height: "calc(100% + 10px)" }}
                                transition={{ duration: 0.5, delay: i * 0.2 + 0.3 }}
                                viewport={{ once: true, margin: "-100px" }}
                              />
                            )}
                            
                            <motion.div 
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shrink-0 z-10"
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
                              className="bg-primary-50 p-4 rounded-lg shadow-sm border border-primary/10 flex-1"
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
                            <span className="text-3xl font-bold">{service?.price}€</span>
                            <span className="text-muted-foreground">HT</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Délai de livraison: {service?.duration} jours</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90"
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
                        En achetant ce service, vous acceptez nos <Link href="/terms" className="underline hover:text-primary">conditions d'utilisation</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 