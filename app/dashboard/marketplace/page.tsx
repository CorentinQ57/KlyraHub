"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { getAllServices, createStripeSession, type Service } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Home, Building2, ImageIcon, Code2, Edit3, Sparkles, ScanLine, BarChart3, ChevronRight, X, Search, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServiceIcon from '@/components/ServiceIcon'
import { motion } from 'framer-motion'
import IconHoverEffect from '@/components/IconHoverEffect'
import { ServiceIconAnimation } from '@/components/ServiceIconAnimation'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'

// Make slug from title
const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-')

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Site web':
      return <Code2 className="h-4 w-4" />
    case 'Design':
      return <Sparkles className="h-4 w-4" />
    case 'Branding':
      return <ImageIcon className="h-4 w-4" />
    case 'Marketing':
      return <BarChart3 className="h-4 w-4" />
    case 'Consulting':
      return <ScanLine className="h-4 w-4" />
    default:
      return <Building2 className="h-4 w-4" />
  }
}

// Extend Service type to include timeline
interface ExtendedService extends Service {
  timeline?: string;
}

// Animation variants for service items
const serviceItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 }
  }
};

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
  const uniqueCategories = Array.from(
    new Set(
      services
        .filter((service): service is ExtendedService & { category: string } => 
          typeof service.category === 'string' && service.category !== '')
        .map(service => service.category)
    )
  ).sort();

  const categories = ['Tous', ...uniqueCategories];

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
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement des services...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer fullWidth>
      <PageHeader
        title="Marketplace" 
        description="Découvrez tous les services proposés par Klyra Design"
      >
        <Button onClick={() => router.push('/dashboard')}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Mes achats
        </Button>
      </PageHeader>

      <ServiceIconAnimation />
      
      <div className="flex flex-1 h-[calc(100vh-250px)] overflow-hidden">
        {/* Sidebar - Left column with filters */}
        <div className="w-64 border-r border-[#E2E8F0] p-4 flex-shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-[16px] font-semibold mb-3">Recherche</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#64748B]" />
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
                    <X className="h-4 w-4 text-[#64748B]" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[16px] font-semibold mb-3">Catégories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      cat === selectedCategory 
                        ? 'bg-[#467FF7] text-white' 
                        : 'hover:bg-[#F8FAFC] text-[#1A2333]'
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {cat !== 'Tous' ? (
                      <span className="mr-2 flex-shrink-0">{getCategoryIcon(cat)}</span>
                    ) : (
                      <span className="mr-2 flex-shrink-0 w-4 h-4">•</span>
                    )}
                    <span className="text-[14px]">{cat}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <h3 className="text-[16px] font-semibold">Prix</h3>
                <span className="text-[14px] text-[#64748B]">
                  {selectedPrice[0]}€ - {selectedPrice[1]}€
                </span>
              </div>
              <Slider
                defaultValue={[0, 5000]}
                max={5000}
                step={100}
                value={selectedPrice}
                onValueChange={setSelectedPrice}
                className="mt-2"
              />
            </div>
          </div>
        </div>
        
        {/* Middle column - Services list */}
        <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0]">
          <div className="p-4">
            <h2 className="text-[18px] font-semibold mb-4">Nos Services ({filteredServices.length})</h2>
            
            <div className="space-y-3">
              {filteredServices.map((service, index) => (
                <motion.div 
                  key={service.id} 
                  className={`group rounded-lg border border-[#E2E8F0] p-4 hover:shadow-sm transition-all cursor-pointer ${
                    selectedService?.id === service.id ? 'border-[#467FF7] bg-[#EBF2FF]' : 'bg-white'
                  }`}
                  onClick={() => handleSelectService(service)}
                  variants={serviceItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex justify-start mb-2">
                    <Badge variant="outline" className="text-[11px] flex items-center p-1 h-5 rounded-full bg-[#EBF2FF] text-[#467FF7] border-[#467FF7]/20">
                      {getCategoryIcon(service.category || 'Autre')}
                      <span className="ml-1 font-medium">{service.category || 'Autre'}</span>
                    </Badge>
                  </div>
                
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <ServiceIcon 
                        serviceName={service.name}
                        variant="minimal"
                        className={`text-[#467FF7] ${selectedService?.id === service.id ? 'animate-pulse' : ''}`}
                      />
                      <div className="ml-3">
                        <h3 className="font-medium text-[14px] line-clamp-1">{service.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-[12px] text-[#64748B]">{service.duration} jours</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-[14px]">{service.price}€</span>
                      <ChevronRight className={`h-4 w-4 mt-2 text-[#64748B] group-hover:text-[#467FF7] transition-transform group-hover:translate-x-1 ${selectedService?.id === service.id ? 'text-[#467FF7]' : ''}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right column - Service details */}
        <div className="w-96 overflow-y-auto">
          {selectedService ? (
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mr-4"
                  >
                    <ServiceIcon 
                      serviceName={selectedService.name} 
                      size="lg" 
                      animate={true}
                      variant="bold"
                      className="text-[#467FF7]"
                    />
                  </motion.div>
                  <motion.h2 
                    className="text-[20px] font-bold"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {selectedService.name}
                  </motion.h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center">
                    {getCategoryIcon(selectedService.category || 'Autre')}
                    <span className="ml-1">{selectedService.category || 'Autre'}</span>
                  </Badge>
                  <Badge variant="secondary">{selectedService.duration} jours</Badge>
                </div>
                
                <motion.p
                  className="text-[14px] text-[#64748B]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {selectedService.description}
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <ContentCard>
                    <h3 className="text-[16px] font-semibold mb-3">Détails</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#64748B]">Catégorie</span>
                        <span>{selectedService.category || 'Autre'}</span>
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#64748B]">Délai</span>
                        <span>{selectedService.duration} jours</span>
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#64748B]">Révisions</span>
                        <span>2 incluses</span>
                      </div>
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#64748B]">Support</span>
                        <span>30 jours</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[14px] text-[#64748B]">Prix</p>
                        <p className="text-[18px] font-bold">{selectedService.price}€</p>
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
                    </div>
                  </ContentCard>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-[14px] text-[#64748B]">Sélectionnez un service pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
} 