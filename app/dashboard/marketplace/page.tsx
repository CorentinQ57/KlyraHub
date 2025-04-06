"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getAllServices, createStripeSession, type Service } from '@/lib/supabase'
import { HeaderNav } from '@/components/HeaderNav'

// Make slug from title
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

export default function MarketplacePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [selectedPrice, setSelectedPrice] = useState('Tous')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const loadServices = async () => {
      const data = await getAllServices()
      setServices(data)
      setIsLoadingServices(false)
    }
    loadServices()
  }, [])

  // Filtrer les services en fonction des catégories et des prix
  const filteredServices = services.filter(service => {
    const categoryMatch = selectedCategory === 'Tous' || service.category === selectedCategory
    
    let priceMatch = true
    if (selectedPrice === '< 1000€') {
      priceMatch = service.price < 1000
    } else if (selectedPrice === '1000€ - 3000€') {
      priceMatch = service.price >= 1000 && service.price <= 3000
    } else if (selectedPrice === '> 3000€') {
      priceMatch = service.price > 3000
    }
    
    return categoryMatch && priceMatch
  })

  // Extraire les catégories uniques des services
  const uniqueCategories = Array.from(new Set(services.map(service => service.category || 'Autre')))
  const categories = ['Tous', ...uniqueCategories]

  const handleBuyNow = async (service: Service, event: React.MouseEvent) => {
    event.preventDefault()
    
    if (!user) {
      toast({
        title: "Connectez-vous",
        description: "Vous devez être connecté pour acheter un service.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }
    
    try {
      setProcessingPayment(service.id)
      
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
      toast({
        title: "Erreur",
        description: errorMessage,
        duration: 5000,
        variant: "destructive"
      })
    } finally {
      setProcessingPayment(null)
    }
  }

  if (isLoading || isLoadingServices) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-16 bg-klyra-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Nos Services
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Découvrez nos services packagés pour transformer votre présence digitale
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-3 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Filtres</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Catégories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs rounded-full px-3 py-1 ${
                            cat === selectedCategory 
                              ? 'bg-klyra text-white' 
                              : 'bg-secondary hover:bg-klyra/20'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Prix</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Tous', '< 1000€', '1000€ - 3000€', '> 3000€'].map((price) => (
                        <button
                          key={price}
                          onClick={() => setSelectedPrice(price)}
                          className={`text-xs rounded-full px-3 py-1 ${
                            price === selectedPrice 
                              ? 'bg-klyra text-white' 
                              : 'bg-secondary hover:bg-klyra/20'
                          }`}
                        >
                          {price}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-9">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <div 
                      key={service.id} 
                      className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all"
                    >
                      <div className="space-y-2">
                        <div className="text-4xl">{service.icon}</div>
                        <h3 className="text-xl font-bold">{service.name}</h3>
                        <p className="text-muted-foreground line-clamp-2">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-klyra">{service.price}€</p>
                          <p className="text-xs text-muted-foreground">{service.duration} jours</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Inclus :</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {(service.features || []).slice(0, 2).map((feature, i) => (
                              <li key={i} className="flex items-center">
                                <span className="mr-1 text-klyra">✓</span> {feature}
                              </li>
                            ))}
                            {(service.features || []).length > 2 && (
                              <li className="text-xs text-muted-foreground">+ {(service.features || []).length - 2} autres...</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-4 flex flex-col space-y-2">
                        <Link href={`/dashboard/marketplace/${getSlug(service.name)}`}>
                          <Button className="w-full">Voir les détails</Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={(e) => handleBuyNow(service, e)}
                          disabled={processingPayment === service.id}
                        >
                          {processingPayment === service.id ? 'Traitement...' : 'Acheter maintenant'}
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 bg-klyra-100 text-klyra-700 text-xs px-2 py-1 rounded-full">
                        {service.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 