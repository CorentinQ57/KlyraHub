"use client"

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, Lock, Award, Users, Download, Video, FileText, MessageSquare, ExternalLink } from 'lucide-react'

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'

// Services
import { useAuth } from '@/lib/auth'
import { Course, CourseModule, CourseLesson, getCourseById, getCourseModules } from '@/lib/academy-service'

export default function CoursePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Récupérer les données du cours et des modules
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true)
      try {
        const courseData = await getCourseById(params.id)
        
        if (!courseData) {
          return notFound()
        }
        
        setCourse(courseData)
        
        // Récupérer les modules et leçons
        const modulesData = await getCourseModules(params.id)
        setModules(modulesData)
        
        // Définir la première leçon comme sélectionnée par défaut
        if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
          setSelectedLesson(modulesData[0].lessons[0])
        }
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourseData()
  }, [params.id])

  // Fonction pour formater la durée totale
  const formatTotalDuration = () => {
    // Calculer la durée totale des leçons (en supposant un format comme "15-20 min")
    let totalMinutes = 0
    
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        // Extraire les minutes du format "XX-YY min" ou "XX min"
        const durationText = lesson.duration
        const minutes = durationText.includes('-')
          ? parseInt(durationText.split('-')[1])
          : parseInt(durationText)
          
        if (!isNaN(minutes)) {
          totalMinutes += minutes
        }
      })
    })
    
    // Formater en heures et minutes
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    } else {
      return `${totalMinutes} min`
    }
  }

  // Composant pour afficher une leçon
  const LessonItem = ({ lesson, moduleId }: { lesson: CourseLesson, moduleId: string }) => {
    const isActive = selectedLesson?.id === lesson.id
    const canAccess = lesson.is_free || user !== null
    
    const handleLessonClick = () => {
      if (!canAccess) return;
      
      // Sélectionner la leçon pour l'affichage dans l'onglet
      setSelectedLesson(lesson);
      
      // Activer l'onglet leçon
      setActiveTab('lesson');
      
      // Option pour naviguer directement vers la page de leçon individuelle
      // router.push(`/dashboard/academy/lessons/${lesson.id}`);
    }
    
    return (
      <div 
        className={`
          flex items-center justify-between p-3 rounded-md cursor-pointer
          ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
          ${!canAccess ? 'opacity-70' : ''}
        `}
        onClick={handleLessonClick}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            {lesson.type === 'video' && <Video className="h-4 w-4" />}
            {lesson.type === 'text' && <FileText className="h-4 w-4" />}
            {lesson.type === 'quiz' && <MessageSquare className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-medium text-sm">{lesson.title}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{lesson.duration}</span>
              
              {lesson.is_free && (
                <>
                  <span>•</span>
                  <span className="text-green-600">Gratuit</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canAccess && (
            <Link href={`/dashboard/academy/lessons/${lesson.id}`}>
              <Button variant="ghost" size="sm" className="px-2 py-1 h-auto">
                Voir
              </Button>
            </Link>
          )}
          
          {canAccess ? (
            <CheckCircle className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-300'}`} />
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
        <PageContainer>
          <PageHeader title="Chargement du cours...">
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

  if (!course) {
    return notFound()
  }

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader title={course.title}>
          <Link href="/dashboard/academy/courses">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux cours
            </Button>
          </Link>
        </PageHeader>

        {/* En-tête du cours */}
        <PageSection className="pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video relative">
                {course.image_url ? (
                  <>
                    <Image
                      src={course.image_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-center justify-center">
                      <Button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        size="lg" 
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      >
                        <Play className="h-8 w-8 text-white" fill="white" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                <Badge className={
                  course.level === 'Débutant' ? 'bg-green-500' :
                  course.level === 'Intermédiaire' ? 'bg-blue-500' : 'bg-purple-500'
                }>
                  {course.level}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
                {course.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    <span>{course.lessons} leçons</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              {/* Cette partie sera déplacée dans l'onglet Vue d'ensemble */}
            </div>
          </div>
        </PageSection>

        {/* Contenu du cours en onglets */}
        <PageSection>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              {selectedLesson && (
                <TabsTrigger value="lesson">Leçon en cours</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ContentCard>
                    <h2 className="text-2xl font-bold mb-4">À propos de ce cours</h2>
                    <p className="text-gray-700 mb-6">{course.description}</p>
                    
                    <h3 className="text-xl font-bold mb-3">Ce que vous apprendrez</h3>
                    <ul className="space-y-2 mb-6">
                      {course.objectives ? course.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      )) : (
                        <>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Maîtriser les concepts fondamentaux du design</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Créer une identité de marque cohérente et professionnelle</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Développer une stratégie de communication efficace</span>
                          </li>
                        </>
                      )}
                    </ul>
                    
                    <h3 className="text-xl font-bold mb-3">Prérequis</h3>
                    <p className="text-gray-700 mb-6">Aucun prérequis spécifique. Ce cours est accessible aux débutants.</p>
                    
                    <h3 className="text-xl font-bold mb-3">Public cible</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Entrepreneurs souhaitant développer leur propre marque</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Étudiants en design ou marketing</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Professionnels cherchant à améliorer leurs compétences</span>
                      </li>
                    </ul>
                  </ContentCard>
                  
                  <div className="mt-8">
                    <ContentCard>
                      <h2 className="text-2xl font-bold mb-4">Instructeur</h2>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src="/images/avatars/instructor.jpg" alt="Sophie Martin" />
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold">Sophie Martin</h3>
                          <p className="text-gray-500 mb-2">Directrice Créative chez Klyra</p>
                          <p className="text-sm text-gray-700">
                            Designer avec plus de 10 ans d'expérience, spécialisée dans l'identité de marque et le design d'interfaces. 
                            Sophie a travaillé avec des startups et des entreprises internationales.
                          </p>
                        </div>
                      </div>
                    </ContentCard>
                  </div>
                  
                  {/* Sections "Inscrivez-vous au cours" et "Ressources incluses" déplacées ici */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Inscrivez-vous au cours</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{course.lessons} leçons</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Accès à vie au contenu</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Certificat d'achèvement</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">Ressources téléchargeables</span>
                          </li>
                        </ul>
                        
                        {user ? (
                          <Button className="w-full" onClick={() => {
                            if (modules.length > 0 && modules[0].lessons.length > 0) {
                              // Rediriger vers la première leçon
                              window.location.href = `/dashboard/academy/lessons/${modules[0].lessons[0].id}`;
                            } else {
                              // Activer l'onglet leçon si pas de leçon disponible
                              setActiveTab('lesson');
                            }
                          }}>Commencer le cours</Button>
                        ) : (
                          <div className="space-y-3">
                            <Button className="w-full">S'inscrire pour commencer</Button>
                            <Link href="/auth" className="block text-center text-sm text-blue-600 hover:text-blue-800">
                              Déjà inscrit? Connectez-vous
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Ressources incluses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex items-center">
                            <div className="mr-3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">Guide de référence PDF</span>
                          </li>
                          <li className="flex items-center">
                            <div className="mr-3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">Exercices pratiques</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="col-span-1">
                  {/* Colonne de droite avec le détail du cours et le contenu du cours */}
                  <ContentCard>
                    <h2 className="text-xl font-bold mb-4">Détails du cours</h2>
                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Durée totale</h3>
                        <p className="font-medium">{formatTotalDuration()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Leçons</h3>
                        <p className="font-medium">{course.lessons} leçons</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Niveau</h3>
                        <p className="font-medium">{course.level}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                        <p className="font-medium">{course.category}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                        <p className="font-medium">{new Date(course.updated_at).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 mb-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Award className="h-10 w-10 text-amber-500" />
                        <div>
                          <h3 className="font-bold">Certificat d'achèvement</h3>
                          <p className="text-sm text-gray-500">Après avoir terminé le cours</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" disabled={!user}>
                        {user ? 'Voir le certificat' : 'Connectez-vous pour obtenir'}
                      </Button>
                    </div>
                    
                    {/* Contenu du cours déplacé ici */}
                    <Separator className="my-6" />
                    
                    <h2 className="text-xl font-bold mb-6">Contenu du cours</h2>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-500">
                          {modules.length} modules • {course.lessons} leçons • {formatTotalDuration()}
                        </p>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        {modules.every(m => m.id === 'expanded') ? 'Réduire tout' : 'Développer tout'}
                      </Button>
                    </div>
                    
                    <Accordion type="multiple" defaultValue={['module-0']} className="space-y-4">
                      {modules.map((module, moduleIndex) => (
                        <AccordionItem 
                          key={module.id} 
                          value={`module-${moduleIndex}`}
                          className="border rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex-1 flex items-center">
                              <span className="text-lg font-medium">{module.title}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                • {module.lessons.length} leçons
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pt-2">
                            <div className="space-y-1 p-1">
                              {module.lessons.map((lesson) => (
                                <LessonItem 
                                  key={lesson.id} 
                                  lesson={lesson} 
                                  moduleId={module.id} 
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ContentCard>
                </div>
              </div>
            </TabsContent>
            
            {selectedLesson && (
              <TabsContent value="lesson" className="mt-0">
                <div className="grid grid-cols-1 gap-6">
                  <ContentCard>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                      
                      <div className="flex items-center gap-4">
                        <Link href={`/dashboard/academy/lessons/${selectedLesson.id}`}>
                          <Button variant="outline" size="sm">
                            Voir en plein écran
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{selectedLesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedLesson.type === 'video' && (
                      <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video relative mb-6">
                        <div className="flex h-full items-center justify-center">
                          <Button 
                            onClick={() => setIsPlaying(!isPlaying)} 
                            size="lg" 
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                          >
                            <Play className="h-8 w-8 text-gray-800" fill="currentColor" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="prose max-w-none">
                      <p>
                        {selectedLesson.description || 'Contenu de la leçon en cours de développement.'}
                      </p>
                      
                      {!selectedLesson.content && (
                        <>
                          <p>
                            Dans cette leçon, nous allons explorer les concepts fondamentaux et les principes clés
                            qui vous permettront de maîtriser ce sujet important. Vous apprendrez des techniques
                            pratiques et des approches méthodiques pour résoudre les problèmes courants.
                          </p>
                          <h3>Points clés de cette leçon</h3>
                          <ul>
                            <li>Comprendre les principes fondamentaux et leur application</li>
                            <li>Développer une approche méthodique pour résoudre les problèmes</li>
                            <li>Appliquer les techniques dans des situations réelles</li>
                            <li>Éviter les erreurs communes et les pièges</li>
                          </ul>
                          <p>
                            Cette leçon contient des exercices pratiques et des exemples concrets pour vous aider
                            à mieux comprendre et appliquer les concepts présentés.
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        disabled={
                          modules[0].lessons[0].id === selectedLesson.id
                        }
                        onClick={() => {
                          // Trouver la leçon précédente
                          let found = false
                          
                          for (const module of modules) {
                            for (let i = 0; i < module.lessons.length; i++) {
                              if (module.lessons[i].id === selectedLesson.id && i > 0) {
                                setSelectedLesson(module.lessons[i - 1])
                                found = true
                                break
                              }
                            }
                            if (found) break
                          }
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Leçon précédente
                      </Button>
                      
                      <Button 
                        disabled={
                          modules[modules.length - 1].lessons[modules[modules.length - 1].lessons.length - 1].id === selectedLesson.id
                        }
                        onClick={() => {
                          // Trouver la leçon suivante
                          let found = false
                          
                          for (const module of modules) {
                            for (let i = 0; i < module.lessons.length; i++) {
                              if (module.lessons[i].id === selectedLesson.id && i < module.lessons.length - 1) {
                                setSelectedLesson(module.lessons[i + 1])
                                found = true
                                break
                              }
                            }
                            if (found) break
                          }
                        }}
                      >
                        Leçon suivante
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </ContentCard>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </PageSection>
      </PageContainer>
    </AuroraBackground>
  )
} 