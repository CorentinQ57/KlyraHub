'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Clock, Play, ArrowUp, ExternalLink } from 'lucide-react'
import Image from 'next/image'

import { AuroraBackground } from '@/components/ui/aurora-background'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageContainer, PageSection, ContentCard } from '@/components/ui/page-container'

import { supabase } from '@/lib/supabase'
import { CourseLesson, CourseModule, getCourseModules } from '@/lib/academy-service'

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<CourseLesson | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [courseTitle, setCourseTitle] = useState<string | null>(null)
  const [module, setModule] = useState<CourseModule | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextLesson, setNextLesson] = useState<CourseLesson | null>(null)
  const [prevLesson, setPrevLesson] = useState<CourseLesson | null>(null)
  
  // Fonction pour convertir les URLs YouTube en URLs d'intégration
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // URL de fallback pour tester
    
    try {
      // Conversion des URLs YouTube standard (watch?v=...)
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Conversion des URLs YouTube courtes (youtu.be/...)
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Si déjà une URL d'intégration
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      
      // Si c'est juste un ID YouTube
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return `https://www.youtube.com/embed/${url}`;
      }
      
      // Pour tout autre type d'URL, essayez de la retourner telle quelle
      return url;
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'URL:', error);
      return 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // URL de fallback en cas d'erreur
    }
  };
  
  // Récupérer les informations de la leçon
  useEffect(() => {
    async function fetchLessonData() {
      try {
        setLoading(true)
        
        // Récupérer la leçon depuis Supabase
        const { data: lessonData, error: lessonError } = await supabase
          .from('course_lessons')
          .select(`
            *,
            course_modules!inner(
              *,
              courses!inner(id, title)
            )
          `)
          .eq('id', lessonId)
          .single()
        
        if (lessonError) {
          console.error('Erreur lors de la récupération de la leçon:', lessonError)
          setError('Impossible de charger cette leçon. Veuillez réessayer plus tard.')
          setLoading(false)
          return
        }
        
        if (!lessonData) {
          setError('Leçon introuvable.')
          setLoading(false)
          return
        }
        
        // Extraire les données de la leçon
        const lessonInfo: CourseLesson = {
          id: lessonData.id,
          title: lessonData.title,
          description: lessonData.description,
          duration: lessonData.duration,
          type: lessonData.type,
          content: lessonData.content,
          video_url: lessonData.video_url,
          order: lessonData.order,
          module_id: lessonData.module_id
        }

        // Ajouter is_free seulement s'il est défini
        if (typeof lessonData.is_free === 'boolean') {
          lessonInfo.is_free = lessonData.is_free
        }
        
        // Extraire les informations du cours
        const courseInfo = lessonData.course_modules.courses
        setCourseId(courseInfo.id)
        setCourseTitle(courseInfo.title)
        
        // Extraire les informations du module
        const moduleInfo = {
          id: lessonData.course_modules.id,
          title: lessonData.course_modules.title,
          description: lessonData.course_modules.description,
          order: lessonData.course_modules.order,
          course_id: lessonData.course_modules.course_id,
          lessons: []
        }
        setModule(moduleInfo)
        
        // Définir la leçon actuelle
        setLesson(lessonInfo)
        
        // Récupérer toutes les leçons du module pour déterminer la suivante et la précédente
        const { data: moduleLessons, error: moduleLessonsError } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', lessonData.module_id)
          .order('order')
        
        if (!moduleLessonsError && moduleLessons) {
          const currentIndex = moduleLessons.findIndex(l => l.id === lessonId)
          
          // Définir la leçon précédente si elle existe
          if (currentIndex > 0) {
            setPrevLesson(moduleLessons[currentIndex - 1])
          } else {
            setPrevLesson(null)
          }
          
          // Définir la leçon suivante si elle existe
          if (currentIndex < moduleLessons.length - 1) {
            setNextLesson(moduleLessons[currentIndex + 1])
          } else {
            // Vérifier s'il y a un module suivant avec des leçons
            const allModules = await getCourseModules(courseInfo.id)
            const currentModuleIndex = allModules.findIndex(m => m.id === moduleInfo.id)
            
            if (currentModuleIndex < allModules.length - 1) {
              const nextModuleLessons = allModules[currentModuleIndex + 1].lessons
              if (nextModuleLessons && nextModuleLessons.length > 0) {
                setNextLesson(nextModuleLessons[0])
              } else {
                setNextLesson(null)
              }
            } else {
              setNextLesson(null)
            }
          }
        }
      } catch (err) {
        console.error('Erreur inattendue:', err)
        setError('Une erreur s\'est produite lors du chargement de la leçon.')
      } finally {
        setLoading(false)
      }
    }
    
    if (lessonId) {
      fetchLessonData()
    }
  }, [lessonId])
  
  // Naviguer vers la page du cours
  const navigateToCourse = () => {
    if (courseId) {
      router.push(`/dashboard/academy/courses/${courseId}`)
    }
  }
  
  // Naviguer vers une autre leçon
  const navigateToLesson = (lesson: CourseLesson) => {
    router.push(`/dashboard/academy/lessons/${lesson.id}`)
  }
  
  if (loading) {
    return (
      <AuroraBackground>
        <PageContainer>
          <PageSection>
            <div className="flex items-center space-x-2 mb-6">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
            
            <ContentCard>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center space-x-2 mb-6">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </ContentCard>
          </PageSection>
        </PageContainer>
      </AuroraBackground>
    )
  }
  
  if (error || !lesson) {
    return (
      <AuroraBackground>
        <PageContainer>
          <PageSection>
            <div className="flex items-center space-x-2 mb-6">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
            
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {error || 'Leçon introuvable. Veuillez réessayer plus tard.'}
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => router.push('/dashboard/academy')}>
              Retour à l'académie
            </Button>
          </PageSection>
        </PageContainer>
      </AuroraBackground>
    )
  }
  
  return (
    <AuroraBackground>
      <PageContainer>
        <PageSection>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={navigateToCourse} className="mr-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au cours
                </Button>
                {courseTitle && (
                  <span className="text-sm text-gray-500">
                    {courseTitle} {module && `/ ${module.title}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <ContentCard>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration}</span>
              </div>
            </div>
            
            {lesson.type === 'video' && lesson.video_url && (
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video relative mb-6">
                <iframe 
                  className="w-full h-full border-0"
                  src={getEmbedUrl(lesson.video_url)}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-700">
                {lesson.description || 'Contenu de la leçon en cours de développement.'}
              </p>
              
              {lesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              ) : (
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
                disabled={!prevLesson}
                onClick={() => prevLesson && navigateToLesson(prevLesson)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Leçon précédente
              </Button>
              
              <Button 
                disabled={!nextLesson}
                onClick={() => nextLesson && navigateToLesson(nextLesson)}
              >
                Leçon suivante
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </ContentCard>
        </PageSection>
      </PageContainer>
    </AuroraBackground>
  )
} 