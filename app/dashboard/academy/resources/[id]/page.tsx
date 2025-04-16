"use client"

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Download, FileText, Video, CheckCircle, Users, Clock, PlayCircle, Share2 } from 'lucide-react'

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Services
import { useAuth } from '@/lib/auth'
import { Resource, getResourceById } from '@/lib/academy-service'

export default function ResourcePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [resource, setResource] = useState<Resource | null>(null)

  // Récupérer les données de la ressource
  useEffect(() => {
    const fetchResourceData = async () => {
      setLoading(true)
      try {
        const resourceData = await getResourceById(params.id)
        
        if (!resourceData) {
          return notFound()
        }
        
        setResource(resourceData)
      } catch (error) {
        console.error("Erreur lors du chargement de la ressource:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchResourceData()
  }, [params.id])

  // Fonction pour obtenir l'icône en fonction du type
  const getResourceTypeIcon = () => {
    switch (resource?.type) {
      case 'eBook':
        return <BookOpen className="h-8 w-8 text-purple-500" />
      case 'Vidéo':
        return <Video className="h-8 w-8 text-red-500" />
      case 'Template':
        return <FileText className="h-8 w-8 text-green-500" />
      case 'Checklist':
        return <CheckCircle className="h-8 w-8 text-blue-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  // Fonction pour obtenir une couleur en fonction du type
  const getResourceTypeColor = () => {
    switch (resource?.type) {
      case 'eBook':
        return 'bg-purple-500'
      case 'Vidéo':
        return 'bg-red-500'
      case 'Template':
        return 'bg-green-500'
      case 'Checklist':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
        <PageContainer>
          <PageHeader title="Chargement de la ressource...">
            <Skeleton className="h-10 w-28" />
          </PageHeader>
          
          <PageSection>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              
              <div className="space-y-6">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </PageSection>
        </PageContainer>
      </AuroraBackground>
    )
  }

  if (!resource) {
    return notFound()
  }

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader title={resource.title}>
          <Link href="/dashboard/academy/resources">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux ressources
            </Button>
          </Link>
        </PageHeader>

        {/* Contenu principal */}
        <PageSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video relative">
                {resource.image_url ? (
                  <Image
                    src={resource.image_url}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {getResourceTypeIcon()}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getResourceTypeColor()}>
                    {resource.type}
                  </Badge>
                  <Badge variant="outline">{resource.category}</Badge>
                  {resource.is_new && (
                    <Badge variant="outline" className="bg-green-500 text-white">
                      Nouveau
                    </Badge>
                  )}
                </div>

                <ContentCard>
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700 mb-6">
                    {resource.description || 
                      "Cette ressource vous offre des informations précieuses et des outils pratiques pour améliorer vos compétences et développer des projets plus efficacement. Explorez le contenu détaillé pour découvrir comment l'utiliser au mieux dans votre contexte professionnel."}
                  </p>

                  <h3 className="text-xl font-bold mb-3">Ce que vous obtiendrez</h3>
                  <ul className="space-y-2 mb-6">
                    {resource.type === 'eBook' && (
                      <>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Un guide complet au format PDF</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des exemples pratiques et études de cas</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des conseils d'experts facilement applicables</span>
                        </li>
                      </>
                    )}
                    {resource.type === 'Template' && (
                      <>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Un modèle prêt à l'emploi</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des instructions détaillées d'utilisation</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des éléments personnalisables</span>
                        </li>
                      </>
                    )}
                    {resource.type === 'Checklist' && (
                      <>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Une liste de vérification complète</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des points d'action classés par priorité</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des conseils pour chaque étape du processus</span>
                        </li>
                      </>
                    )}
                    {resource.type === 'Vidéo' && (
                      <>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Une vidéo pédagogique de haute qualité</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des explications claires et concises</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Des démonstrations pratiques</span>
                        </li>
                      </>
                    )}
                  </ul>

                  <h3 className="text-xl font-bold mb-3">Pour qui ?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Professionnels cherchant à améliorer leurs compétences</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Entrepreneurs et équipes de startups</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Étudiants et apprenants autodidactes</span>
                    </li>
                  </ul>
                </ContentCard>
              </div>

              <div className="mt-8">
                <ContentCard>
                  <h2 className="text-2xl font-bold mb-4">Créateur</h2>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/images/avatars/creator.jpg" alt="Thomas Dubois" />
                      <AvatarFallback>TD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">Thomas Dubois</h3>
                      <p className="text-gray-500 mb-2">Expert en Marketing Digital chez Klyra</p>
                      <p className="text-sm text-gray-700">
                        Spécialiste en stratégies digitales et branding, Thomas a plus de 8 ans d'expérience dans 
                        l'accompagnement d'entreprises de toutes tailles pour développer leur présence en ligne.
                      </p>
                    </div>
                  </div>
                </ContentCard>
              </div>
            </div>
            
            <div className="col-span-1">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Télécharger maintenant</CardTitle>
                    {getResourceTypeIcon()}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Format optimisé</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Accès immédiat</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Téléchargement illimité</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Ressource gratuite</span>
                    </li>
                  </ul>
                  
                  {resource.download_link ? (
                    <a href={resource.download_link} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </a>
                  ) : (
                    resource.type === 'Vidéo' ? (
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Regarder la vidéo
                      </Button>
                    ) : (
                      <Button className="w-full" disabled={!user}>
                        {user ? (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Connectez-vous pour télécharger
                          </>
                        )}
                      </Button>
                    )
                  )}
                  
                  {!user && (
                    <Link href="/auth" className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-3">
                      Créer un compte gratuit
                    </Link>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full">
                    <p className="text-sm text-gray-500 mb-2">Partager cette ressource</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="mt-6">
                <ContentCard>
                  <h2 className="text-xl font-bold mb-4">Ressources similaires</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Guide pratique de l'UX Design</h3>
                        <span className="text-xs text-gray-500">eBook</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                        <div className="flex h-full items-center justify-center">
                          <Video className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Introduction à Adobe XD</h3>
                        <span className="text-xs text-gray-500">Vidéo</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                        <div className="flex h-full items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Audit de site web</h3>
                        <span className="text-xs text-gray-500">Checklist</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link href="/dashboard/academy/resources">
                      <Button variant="ghost" size="sm" className="w-full">
                        Voir toutes les ressources
                      </Button>
                    </Link>
                  </div>
                </ContentCard>
              </div>
            </div>
          </div>
        </PageSection>
      </PageContainer>
    </AuroraBackground>
  )
} 