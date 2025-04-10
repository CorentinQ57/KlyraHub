"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getAllServices, createStripeSession, type Service } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Home, Building2, Image, Code, Edit3, PenTool, Eye, Activity, ChevronRight, X, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

// Make slug from title
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Site web':
      return <Code className="h-4 w-4" />
    case 'Design':
      return <PenTool className="h-4 w-4" />
    case 'Branding':
      return <Image className="h-4 w-4" />
    case 'Marketing':
      return <Activity className="h-4 w-4" />
    case 'Consulting':
      return <Eye className="h-4 w-4" />
    default:
      return <Building2 className="h-4 w-4" />
  }
}

// Extend Service type to include timeline
interface ExtendedService extends Service {
  timeline?: string;
}

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState<ExtendedService[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [selectedPrice, setSelectedPrice] = useState([0, 5000])
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ExtendedService | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const loadServices = async () => {
      const data = await getAllServices()
      // Only show active services in the marketplace
      const activeServices = data.filter(service => service.active)
      setServices(activeServices)
      
      // Set initial selected service from URL or first service
      const serviceIdFromUrl = searchParams.get('service')
      if (serviceIdFromUrl) {
        const serviceFromUrl = activeServices.find(s => s.id === serviceIdFromUrl)
        if (serviceFromUrl) {
          setSelectedService(serviceFromUrl)
        } else if (activeServices.length > 0) {
          setSelectedService(activeServices[0])
        }
      } else if (activeServices.length > 0) {
        setSelectedService(activeServices[0])
      }
      
      setIsLoadingServices(false)
    }
    loadServices()
  }, [searchParams])

  // Filtrer les services en fonction des catégories, prix et recherche
  const filteredServices = services.filter(service => {
    const categoryMatch = selectedCategory === 'Tous' || service.category === selectedCategory
    const priceMatch = service.price >= selectedPrice[0] && service.price <= selectedPrice[1]
    const searchMatch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && priceMatch && searchMatch
  })

  // Extraire les catégories uniques des services
  const uniqueCategories = Array.from(new Set(services.map(service => service.category || 'Autre')))
  const categories = ['Tous', ...uniqueCategories]

  const handleBuyNow = async (service: ExtendedService, event: React.MouseEvent) => {
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

  const handleSelectService = (service: ExtendedService) => {
    setSelectedService(service)
    // Update URL without reloading the page
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('service', service.id)
    window.history.pushState({}, '', newUrl.toString())
  }

  if (isLoading || isLoadingServices) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Left column with filters */}
        <div className="w-64 border-r bg-background p-4 flex-shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Recherche</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="absolute right-2 top-2.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Catégories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      cat === selectedCategory 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {cat !== 'Tous' && (
                      <span className="mr-2">{getCategoryIcon(cat)}</span>
                    )}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">Prix</h3>
                <span className="text-sm text-muted-foreground">
                  {selectedPrice[0]}€ - {selectedPrice[1]}€
                </span>
              </div>
              <Slider
                defaultValue={[0, 5000]}
                max={5000}
                step={100}
                value={selectedPrice}
                onValueChange={setSelectedPrice}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0€</span>
                <span>5000€</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Résultats</h3>
              <p className="text-sm text-muted-foreground">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} trouvé{filteredServices.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Middle column - Service listing */}
        <div className="flex-1 overflow-y-auto border-r bg-muted/20">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Nos Services</h2>
            
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`group rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
                    selectedService?.id === service.id ? 'border-primary bg-primary/5' : 'bg-background'
                  }`}
                  onClick={() => handleSelectService(service)}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="mr-3 text-2xl">{service.icon}</div>
                        <div>
                          <h3 className="text-lg font-medium leading-tight">{service.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {getCategoryIcon(service.category || 'Autre')}
                            <span className="ml-1">{service.category || 'Autre'}</span>
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-lg">{service.price}€</p>
                      <ChevronRight className={`h-5 w-5 mt-4 ${
                        selectedService?.id === service.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}

              {filteredServices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun service ne correspond à votre recherche</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSelectedCategory('Tous')
                      setSelectedPrice([0, 5000])
                      setSearchQuery('')
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Selected service details */}
        <div className="w-96 bg-background overflow-y-auto">
          {selectedService ? (
            <div className="p-4">
              <div className="space-y-4">
                <div className="text-3xl">{selectedService.icon}</div>
                <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {getCategoryIcon(selectedService.category || 'Autre')}
                    <span className="ml-1">{selectedService.category || 'Autre'}</span>
                  </Badge>
                  <Badge variant="secondary">{selectedService.duration} jours</Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedService.description}</p>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xl">Détails</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Inclus</h4>
                        <ul className="mt-1 space-y-1">
                          {(selectedService.features || []).map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2 text-primary">✓</span> 
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {selectedService.timeline && (
                        <div>
                          <h4 className="font-medium">Calendrier</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selectedService.timeline}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">Prix</p>
                      <p className="text-xl font-bold">{selectedService.price}€</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/dashboard/marketplace/${getSlug(selectedService.name)}`}>
                        <Button className="w-full" variant="outline">Détails complets</Button>
                      </Link>
                      <Button 
                        className="w-full"
                        onClick={(e) => handleBuyNow(selectedService, e)}
                        disabled={processingPayment === selectedService.id}
                      >
                        {processingPayment === selectedService.id ? 'Traitement...' : 'Acheter'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Sélectionnez un service pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 