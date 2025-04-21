'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, Lock, Award, Users, Download, Video, FileText, MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

// Services
import { useAuth } from '@/lib/auth';
import { Course, CourseModule, CourseLesson, getCourseById, getCourseModules } from '@/lib/academy-service';

export default function CoursePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les données du cours et des modules
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const courseData = await getCourseById(params.id);
        
        if (!courseData) {
          return notFound();
        }
        
        setCourse(courseData);
        
        // Récupérer les modules et leçons
        const modulesData = await getCourseModules(params.id);
        setModules(modulesData);
        
        // Définir la première leçon comme sélectionnée par défaut
        if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
          setSelectedLesson(modulesData[0].lessons[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [params.id]);

  // Fonction pour détecter si l'URL est une vidéo (YouTube ou Vimeo)
  const isVideoUrl = (url?: string) => {
    if (!url) {
      return false;
    }
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  // Fonction pour convertir les URLs YouTube/Vimeo en URLs d'intégration
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) {
      return '';
    }
    
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
      
      // Conversion des URLs Vimeo
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }
      
      return url;
    } catch (error) {
      console.error('Erreur lors de la conversion de l\'URL:', error);
      return url;
    }
  };

  // Fonction pour formater la durée totale
  const formatTotalDuration = () => {
    // Calculer la durée totale des leçons (en supposant un format comme "15-20 min")
    let totalMinutes = 0;
    
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        // Extraire les minutes du format "XX-YY min" ou "XX min"
        const durationText = lesson.duration;
        const minutes = durationText.includes('-')
          ? parseInt(durationText.split('-')[1])
          : parseInt(durationText);
          
        if (!isNaN(minutes)) {
          totalMinutes += minutes;
        }
      });
    });
    
    // Formater en heures et minutes
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else {
      return `${totalMinutes} min`;
    }
  };

  // Composant pour afficher une leçon
  const LessonItem = ({ lesson, moduleId }: { lesson: CourseLesson, moduleId: string }) => {
    const isActive = selectedLesson?.id === lesson.id;
    
    const handleLessonClick = () => {
      // Sélectionner la leçon pour l'affichage
      setSelectedLesson(lesson);
      
      // Réinitialiser l'état de lecture pour la nouvelle leçon
      setIsPlaying(false);
      
      // Faire défiler la page vers le haut pour voir la vidéo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    return (
      <div 
        className={`
          flex items-center justify-between p-3 rounded-md cursor-pointer
          ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
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
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CheckCircle className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-300'}`} />
        </div>
      </div>
    );
  };

  const getPreviousLesson = () => {
    if (!selectedLesson || !modules) {
      return null;
    }
    
    let previousLesson: CourseLesson | null = null;
    for (let i = 0; i < modules.length; i++) {
      const moduleIndex = modules[i].lessons.findIndex(lesson => lesson.id === selectedLesson.id);
      if (moduleIndex !== -1) {
        if (moduleIndex > 0) {
          previousLesson = modules[i].lessons[moduleIndex - 1];
        } else if (i > 0) {
          previousLesson = modules[i - 1].lessons[modules[i - 1].lessons.length - 1];
        }
        break;
      }
    }
    return previousLesson;
  };

  const getNextLesson = () => {
    if (!selectedLesson || !modules) {
      return null;
    }
    
    let nextLesson: CourseLesson | null = null;
    for (let i = 0; i < modules.length; i++) {
      const moduleIndex = modules[i].lessons.findIndex(lesson => lesson.id === selectedLesson.id);
      if (moduleIndex !== -1) {
        if (moduleIndex < modules[i].lessons.length - 1) {
          nextLesson = modules[i].lessons[moduleIndex + 1];
        } else if (i < modules.length - 1) {
          nextLesson = modules[i + 1].lessons[0];
        }
        break;
      }
    }
    return nextLesson;
  };

  const handleLessonClick = (lesson: CourseLesson | null) => {
    if (lesson) {
      setSelectedLesson(lesson);
    }
  };

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
    );
  }

  if (!course) {
    return notFound();
  }

  // Debug - Afficher les informations sur la vidéo sélectionnée
  console.log('Leçon sélectionnée:', selectedLesson);
  if (selectedLesson?.video_url) {
    console.log('URL vidéo originale:', selectedLesson.video_url);
    console.log('URL vidéo transformée:', getEmbedUrl(selectedLesson.video_url));
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
                {selectedLesson ? (
                  selectedLesson.type === 'video' && selectedLesson.video_url ? (
                    <iframe 
                      className="w-full h-full border-0"
                      src={getEmbedUrl(selectedLesson.video_url)}
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-20 w-20 text-gray-400" />
                    </div>
                  )
                ) : course.video_url ? (
                  <iframe 
                    className="w-full h-full border-0"
                    src={getEmbedUrl(course.video_url)}
                    title={course.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                ) : course.image_url ? (
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

              {selectedLesson && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{selectedLesson.duration}</span>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p>{selectedLesson.description || 'Contenu de la leçon en cours de développement.'}</p>
                    {selectedLesson.content && (
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content || '' }} />
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleLessonClick(getPreviousLesson())}
                      disabled={!selectedLesson || !getPreviousLesson()}
                      className="flex items-center space-x-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Précédent</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLessonClick(getNextLesson())}
                      disabled={!selectedLesson || !getNextLesson()}
                      className="flex items-center space-x-2"
                    >
                      <span>Suivant</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

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
            
            {/* Colonne de droite avec le contenu du cours */}
            <div className="col-span-1">
              <ContentCard className="h-full overflow-auto">
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
                
                <Accordion type="multiple" defaultValue={['module-0', 'introduction']} className="space-y-4">
                  {/* Section Introduction */}
                  {course.video_url && (
                    <AccordionItem 
                      value="introduction"
                      className="border rounded-lg overflow-hidden bg-blue-50/50"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:bg-blue-50">
                        <div className="flex-1 flex items-center">
                          <Video className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="text-lg font-medium">Introduction au cours</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pt-2">
                        <div className="space-y-1 p-1">
                          <div 
                            className="flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-blue-50"
                            onClick={() => {
                              setSelectedLesson(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                                <Play className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Présentation du cours</h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>5 min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Modules du cours */}
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
        </PageSection>

        {/* Contenu du cours en onglets */}
        <PageSection>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 gap-8">
                <ContentCard>
                  <h2 className="text-2xl font-bold mb-4">À propos de ce cours</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Durée totale</h3>
                      <p className="font-medium">{formatTotalDuration()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Leçons</h3>
                      <p className="font-medium">{course.lessons} leçons</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Niveau</h3>
                      <p className="font-medium">{course.level}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Catégorie</h3>
                      <p className="font-medium">{course.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Dernière mise à jour</h3>
                      <p className="font-medium">{new Date(course.updated_at).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                      })}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <Award className="h-10 w-10 text-amber-500" />
                        <div>
                          <h3 className="font-bold">Certificat d'achèvement</h3>
                          <p className="text-sm text-gray-500">Après avoir terminé le cours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
            </TabsContent>
          </Tabs>
        </PageSection>
      </PageContainer>
    </AuroraBackground>
  );
} 