"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, Lock, Award, Download, Video, FileText, MessageSquare, ExternalLink, Calendar, Layers, ChevronLeft, ChevronRight, AlertTriangle, Bookmark, Shield, Info, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { getCourseById } from '@/lib/academy-service'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

// Components
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

// Fonction utilitaire pour formater la durée (en minutes)
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
};

// Types
type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  duration: string | number;
  type: 'video' | 'text' | 'quiz';
  content?: string;
  video_url?: string;
  order: number;
  module_id: string;
};

type CourseModule = {
  id: string;
  title: string;
  description?: string;
  order: number;
  course_id: string;
  lessons: CourseLesson[];
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<any>({})
  const [courseResources, setCourseResources] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previousLesson, setPreviousLesson] = useState<CourseLesson | null>(null)
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null)
  const [totalDuration, setTotalDuration] = useState(0)

  // Naviguer entre les leçons
  const handleLessonNavigate = (lesson: CourseLesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson');
  };
  
  // Mettre à jour les leçons précédentes et suivantes quand une leçon est sélectionnée
  useEffect(() => {
    if (!selectedLesson || !course.modules) return;
    
    let foundPrevious = null;
    let foundNext = null;
    let foundCurrent = false;
    
    // Parcourir tous les modules et leçons pour trouver la précédente et la suivante
    for (const module of course.modules) {
      for (let i = 0; i < module.lessons.length; i++) {
        const lesson = module.lessons[i];
        
        if (foundCurrent && !foundNext) {
          foundNext = lesson;
          break;
        }
        
        if (lesson.id === selectedLesson.id) {
          foundCurrent = true;
        } else if (!foundCurrent) {
          foundPrevious = lesson;
        }
      }
      
      if (foundNext) break;
    }
    
    setPreviousLesson(foundPrevious);
    setNextLesson(foundNext);
  }, [selectedLesson, course.modules]);

  // Récupérer les données du cours
  const fetchCourseData = async () => {
    setLoading(true)
    try {
      const data = await getCourseById(params.id)
      if (data) {
        setCourse(data)
        
        // Fetch course resources - this would need to be implemented if needed
        // For now, use an empty array since the Course type doesn't have resources
        setCourseResources([])
        
        // Calculate total duration once when course data is loaded
        if (data.modules) {
          let duration = 0
          data.modules.forEach((module: CourseModule) => {
            module.lessons.forEach((lesson: CourseLesson) => {
              duration += Number(lesson.duration) || 0
            })
          })
          setTotalDuration(duration)
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du cours",
          variant: "destructive",
        })
        router.push('/dashboard/academy/courses')
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement du cours",
        variant: "destructive",
      })
      router.push('/dashboard/academy/courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [params.id])

  const isVideoUrl = (url?: string) => {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
  }

  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return ''
    
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop()
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    
    return url
  }

  const formatTotalDuration = () => {
    // Use the stored total duration instead of recalculating
    const totalMinutes = totalDuration
    
    if (totalMinutes < 60) {
      return `${totalMinutes} min`
    }
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    if (minutes === 0) {
      return `${hours} h`
    }
    
    return `${hours} h ${minutes} min`
  }

  const LessonItem = ({ lesson, moduleId }: { lesson: CourseLesson, moduleId: string }) => {
    const handleLessonClick = () => {
      setSelectedLesson(lesson)
      setActiveTab('lesson')
    }
    
    return (
      <div 
        onClick={handleLessonClick}
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          {lesson.type === 'video' && <Video className="h-4 w-4 text-blue-500" />}
          {lesson.type === 'text' && <FileText className="h-4 w-4 text-green-500" />}
          {lesson.type === 'quiz' && <MessageSquare className="h-4 w-4 text-purple-500" />}
          <span className="line-clamp-1">{lesson.title}</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatDuration(Number(lesson.duration) || 0)}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour aux cours
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.category}</Badge>
            {course.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="bg-blue-50">{tag}</Badge>
            ))}
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTotalDuration()}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne principale - Informations sur le cours */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              {selectedLesson && (
                <TabsTrigger value="lesson">Leçon en cours</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <ContentCard>
                {/* Vidéo ou image du cours */}
                <div className="relative w-full overflow-hidden rounded-lg">
                  {course.video_url ? (
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={getEmbedUrl(course.video_url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </AspectRatio>
                  ) : (
                    course.image_url && (
                      <AspectRatio ratio={16 / 9}>
                        <Image
                          src={course.image_url}
                          alt={course.title}
                          className="object-cover rounded-lg"
                          fill
                        />
                      </AspectRatio>
                    )
                  )}
                </div>
                
                <div className="space-y-4 mt-6">
                  {/* Description */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">À propos de ce cours</h2>
                    <div className="prose prose-blue max-w-none">
                      {course.description && <p>{course.description}</p>}
                    </div>
                  </div>

                  {/* Objectifs */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold">Ce que vous allez apprendre</h2>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.objectives.map((objective: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2 mt-0.5" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Pré-requis */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Pré-requis</h2>
                    {course.prerequisites && course.prerequisites.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {course.prerequisites.map((prerequisite: string, index: number) => (
                          <li key={index}>{prerequisite}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucun pré-requis spécifique n'est nécessaire pour ce cours.
                      </p>
                    )}
                  </div>
                  
                  {/* Public cible */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Pour qui est ce cours</h2>
                    {course.targetAudience && course.targetAudience.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {course.targetAudience.map((audience: string, index: number) => (
                          <li key={index}>{audience}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        Ce cours s'adresse à toute personne intéressée par {course.category}.
                      </p>
                    )}
                  </div>
                </div>
              </ContentCard>

              {/* Ressources du cours (déplacé en bas) */}
              {courseResources.length > 0 && (
                <ContentCard>
                  <h2 className="text-xl font-bold mb-4">Ressources incluses</h2>
                  <div className="space-y-3">
                    {courseResources.map((resource: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Bookmark className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-500">{resource.description}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              )}

              {/* Inscription au cours (déplacé en bas) */}
              <ContentCard>
                <h2 className="text-xl font-bold mb-4">Commencer le cours</h2>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Accès complet au contenu du cours</span>
                  </div>
                  <Button 
                    onClick={() => {
                      if (course.modules?.length > 0 && course.modules[0].lessons.length > 0) {
                        handleLessonNavigate(course.modules[0].lessons[0]);
                      }
                    }}
                    className="w-full"
                  >
                    Commencer le cours
                  </Button>
                </div>
              </ContentCard>
            </TabsContent>
            
            {selectedLesson && (
              <TabsContent value="lesson">
                <div className="space-y-6">
                  <ContentCard>
                    <h1 className="text-2xl font-bold mb-4">{selectedLesson.title}</h1>
                    
                    {selectedLesson.type === 'video' && selectedLesson.video_url && (
                      <div className="mb-6">
                        <AspectRatio ratio={16 / 9}>
                          <iframe
                            src={getEmbedUrl(selectedLesson.video_url)}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </AspectRatio>
                      </div>
                    )}
                    
                    {selectedLesson.type === 'text' && selectedLesson.content && (
                      <div className="prose prose-blue max-w-none mb-6">
                        <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                      </div>
                    )}
                    
                    {selectedLesson.type === 'quiz' && (
                      <div className="p-6 border rounded-lg bg-yellow-50 text-yellow-800 mb-6">
                        <div className="flex items-center mb-4">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <h3 className="font-semibold">Quiz en construction</h3>
                        </div>
                        <p>
                          Cette fonctionnalité sera bientôt disponible. Vous pourrez tester
                          vos connaissances avec des quiz interactifs.
                        </p>
                      </div>
                    )}
                    
                    {/* Navigation entre les leçons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                        disabled={!previousLesson}
                        onClick={() => previousLesson && handleLessonNavigate(previousLesson)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Leçon précédente</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                        disabled={!nextLesson}
                        onClick={() => nextLesson && handleLessonNavigate(nextLesson)}
                      >
                        <span>Leçon suivante</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </ContentCard>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Colonne de droite - Contenu du cours */}
        <div className="lg:col-span-4 space-y-6">
          <ContentCard>
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Contenu du cours</h2>
              
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium">{course.modules?.length || 0} modules</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium">{course.lessons} leçons</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {course.modules?.map((module: CourseModule, index: number) => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="font-medium">{module.title}</h3>
                    </div>
                    
                    <ul className="pl-8 space-y-1">
                      {module.lessons.map((lesson: CourseLesson) => (
                        <li 
                          key={lesson.id}
                          className="flex items-center space-x-2 text-sm cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setActiveTab('lesson');
                          }}
                        >
                          {lesson.type === 'video' && <Video className="h-3 w-3" />}
                          {lesson.type === 'text' && <FileText className="h-3 w-3" />}
                          {lesson.type === 'quiz' && <MessageSquare className="h-3 w-3" />}
                          <span className="line-clamp-1">{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  )
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Non spécifié';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};