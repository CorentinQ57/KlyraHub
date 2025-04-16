"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Download, FileText, Filter, PlayCircle, Search, BookOpen, File, Zap } from 'lucide-react'

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// Services
import { Resource, getResources, getResourcesByCategory, getResourcesByType } from '@/lib/academy-service'

export default function ResourcesPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const typeParam = searchParams.get('type')
  
  const [activeTab, setActiveTab] = useState(categoryParam?.toLowerCase() || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>(typeParam?.toLowerCase() || 'all')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      try {
        let resourcesData;
        
        if (categoryParam) {
          resourcesData = await getResourcesByCategory(categoryParam)
        } else if (typeParam) {
          resourcesData = await getResourcesByType(typeParam)
        } else {
          resourcesData = await getResources()
        }
        
        setResources(resourcesData)
      } catch (error) {
        console.error('Erreur lors du chargement des ressources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [categoryParam, typeParam])

  // Filtrer les ressources en fonction des critères
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedType === 'all' || resource.type.toLowerCase() === selectedType.toLowerCase()
    
    const matchesCategory = activeTab === 'all' || (resource.category && resource.category.toLowerCase() === activeTab.toLowerCase())
    
    return matchesSearch && matchesType && matchesCategory
  })

  // Composant pour la carte de ressource
  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        {resource.image_url ? (
          <div className="relative h-full w-full">
            <Image
              src={resource.image_url}
              alt={resource.title}
              width={500}
              height={300}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {resource.is_popular && (
            <Badge variant="secondary" className="bg-amber-500 text-white">
              Populaire
            </Badge>
          )}
          {resource.is_new && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Nouveau
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={
            resource.type === 'eBook' ? 'bg-purple-500' :
            resource.type === 'Vidéo' ? 'bg-red-500' :
            resource.type === 'Template' ? 'bg-green-500' : 'bg-blue-500'
          }>
            {resource.type}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{resource.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant={resource.download_link ? "default" : "outline"}
          className="w-full"
        >
          {resource.download_link ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Voir le contenu
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )

  // Composant pour le squelette de chargement
  const ResourceCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader 
          title="Ressources" 
          description="Explorez notre bibliothèque de contenus téléchargeables gratuits"
        >
          <Link href="/dashboard/academy">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'Academy
            </Button>
          </Link>
        </PageHeader>

        <PageSection>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Rechercher une ressource..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="ebook">eBooks</SelectItem>
                  <SelectItem value="vidéo">Vidéos</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="checklist">Checklists</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <ResourceCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune ressource trouvée</h3>
                  <p className="text-gray-500">Veuillez modifier vos critères de recherche</p>
                </div>
              )}
            </TabsContent>
            
            {/* Les autres TabsContent seront automatiquement gérés par le filtrage */}
            <TabsContent value="design" className="mt-0">
              {/* Contenu géré par filteredResources */}
            </TabsContent>
            
            <TabsContent value="marketing" className="mt-0">
              {/* Contenu géré par filteredResources */}
            </TabsContent>
            
            <TabsContent value="branding" className="mt-0">
              {/* Contenu géré par filteredResources */}
            </TabsContent>
          </Tabs>
        </PageSection>

        <PageSection title="Collections spéciales" description="Ensembles de ressources organisés par thématique">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none relative overflow-hidden">
              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold mb-2">Pack Design System</h3>
                <p className="text-gray-600 mb-4">
                  Tous les outils et templates nécessaires pour créer un design system complet et cohérent.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">5 eBooks</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm">8 Templates</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">3 Checklists</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm">Accès premium</span>
                  </div>
                </div>
                <Button>Accéder à la collection</Button>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <File className="w-full h-full text-blue-500" />
              </div>
            </ContentCard>
            
            <ContentCard className="bg-gradient-to-r from-amber-50 to-orange-50 border-none relative overflow-hidden">
              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold mb-2">Collection UI/UX Mobile</h3>
                <p className="text-gray-600 mb-4">
                  Ressources spécialisées pour la conception d'interfaces mobiles intuitives et performantes.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">3 eBooks</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm">10 Templates</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">5 Checklists</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm">Vidéos exclusives</span>
                  </div>
                </div>
                <Button>Accéder à la collection</Button>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <File className="w-full h-full text-amber-500" />
              </div>
            </ContentCard>
          </div>
        </PageSection>

        <PageSection>
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">Soumettre une ressource</h2>
                <p className="text-gray-600 mb-6">
                  Vous êtes designer ou expert en branding et souhaitez partager votre expertise avec la communauté ?
                  Soumettez votre contenu pour qu'il soit inclus dans notre bibliothèque de ressources.
                </p>
                <Button>Proposer une ressource</Button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">eBook</p>
                      <p className="text-sm text-gray-500">PDF, EPUB</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <PlayCircle className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="font-medium">Vidéo</p>
                      <p className="text-sm text-gray-500">MP4, WEBM</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <File className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">Template</p>
                      <p className="text-sm text-gray-500">Figma, Sketch</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                    <FileText className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <p className="font-medium">Checklist</p>
                      <p className="text-sm text-gray-500">PDF, DOC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageSection>
      </PageContainer>

      <Separator className="my-8" />
      
      <div className="bg-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Besoin d'aide pour trouver une ressource ?</h2>
            <p className="text-muted-foreground">
              Notre équipe peut vous recommander des ressources adaptées à vos besoins spécifiques.
            </p>
          </div>
          <Button variant="outline">Demander des recommandations</Button>
        </div>
      </div>
    </AuroraBackground>
  )
} 