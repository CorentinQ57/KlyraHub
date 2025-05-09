'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Filter, FileText, PlayCircle, Search, Trophy, Users, Play } from 'lucide-react';

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Services
import { Course, getCourses, getCoursesByCategory } from '@/lib/academy-service';

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeTab, setActiveTab] = useState(categoryParam?.toLowerCase() || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let coursesData;
        
        if (categoryParam) {
          coursesData = await getCoursesByCategory(categoryParam);
        } else {
          coursesData = await getCourses();
        }
        
        setCourses(coursesData);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryParam]);

  // Filtrer les cours en fonction des critères
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel.toLowerCase();
    
    const matchesCategory = activeTab === 'all' || (course.category && course.category.toLowerCase() === activeTab.toLowerCase());
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Composant pour la carte de cours
  const CourseCard = ({ course }: { course: Course }) => {
    const isVideo = course.image_url?.includes('youtube.com') || course.image_url?.includes('vimeo.com');
    const [isHovered, setIsHovered] = useState(false);
    
    // Fonction pour convertir les URLs YouTube/Vimeo en URLs d'aperçu d'image
    const getVideoThumbnail = (url: string) => {
      try {
        // YouTube
        if (url.includes('youtube.com/watch')) {
          const videoId = new URL(url).searchParams.get('v');
          if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }
        
        // YouTube format court
        if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
          if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }
        
        // Vimeo (note: l'implémentation complète nécessiterait l'API Vimeo)
        if (url.includes('vimeo.com/')) {
          // Simplification - dans un cas réel, il faudrait utiliser l'API Vimeo
          const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
          if (videoId) {
            // Utiliser une image générique pour Vimeo
            return '/images/academy/vimeo-placeholder.jpg';
          }
        }
        
        // Par défaut, retourner l'URL telle quelle (peut-être déjà une image)
        return url;
      } catch (error) {
        console.error('Erreur lors de la conversion de l\'URL en miniature:', error);
        return url;
      }
    };

    return (
      <Link href={`/dashboard/academy/courses/${course.id}`}>
        <div 
          className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-md"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-video overflow-hidden">
            {isVideo ? (
              <>
                <Image
                  src={getVideoThumbnail(course.image_url)}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-white/80 p-2 backdrop-blur-sm">
                    <Play className="h-6 w-6 text-blue-600" fill="currentColor" />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={course.image_url || '/images/academy/courses/default.jpg'}
                alt={course.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-3 px-4">
              <div className="flex gap-2">
                <Badge className={
                  course.level === 'Débutant' ? 'bg-green-500' :
                    course.level === 'Intermédiaire' ? 'bg-blue-500' : 'bg-purple-500'
                }>
                  {course.level}
                </Badge>
                {course.is_new && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">Nouveau</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg leading-tight mb-2">{course.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {course.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-1 h-4 w-4" />
                  <span>{course.lessons} leçons</span>
                </div>
              </div>
              
              <div className="text-primary font-medium flex items-center">
                Voir le cours
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Composant pour le squelette de chargement
  const CourseCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader 
          title="Cours et Formations" 
          description="Développez vos compétences avec nos cours exclusifs"
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
                placeholder="Rechercher un cours..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Niveau" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="débutant">Débutant</SelectItem>
                  <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="développement">Développement</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <CourseCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
                  <p className="text-gray-500">Veuillez modifier vos critères de recherche</p>
                </div>
              )}
            </TabsContent>
            
            {/* Les autres TabsContent seront automatiquement gérés par le filtrage */}
            <TabsContent value="design" className="mt-0">
              {/* Contenu géré par filteredCourses */}
            </TabsContent>
            
            <TabsContent value="développement" className="mt-0">
              {/* Contenu géré par filteredCourses */}
            </TabsContent>
            
            <TabsContent value="branding" className="mt-0">
              {/* Contenu géré par filteredCourses */}
            </TabsContent>
          </Tabs>
        </PageSection>

        <PageSection title="Parcours d'apprentissage recommandés" description="Progressez étape par étape avec nos parcours structurés">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Parcours Design UI/UX</h3>
                    <p className="text-sm text-gray-500">De débutant à designer professionnel en 3 mois</p>
                  </div>
                  <Badge className="bg-blue-500">12 semaines</Badge>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Fondamentaux du design d'interface</p>
                      <p className="text-sm text-gray-500">4 cours - 12h de contenu</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium">UX Research & Wireframing</p>
                      <p className="text-sm text-gray-500">3 cours - 9h de contenu</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Design UI avancé & Prototypage</p>
                      <p className="text-sm text-gray-500">5 cours - 15h de contenu</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Démarrer ce parcours</Button>
              </div>
            </Card>
            
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Parcours Branding Complet</h3>
                    <p className="text-sm text-gray-500">Créez une identité de marque forte et cohérente</p>
                  </div>
                  <Badge className="bg-amber-500">8 semaines</Badge>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Fondements du branding</p>
                      <p className="text-sm text-gray-500">3 cours - 8h de contenu</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Identité visuelle & Design</p>
                      <p className="text-sm text-gray-500">4 cours - 12h de contenu</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Stratégie de marque digitale</p>
                      <p className="text-sm text-gray-500">3 cours - 10h de contenu</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Démarrer ce parcours</Button>
              </div>
            </Card>
          </div>
        </PageSection>

        <PageSection>
          <div className="bg-gray-50 rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Certification Klyra Design</h2>
              <p className="text-gray-600 mb-6">
                Obtenez notre certification reconnue par l'industrie et démontrez vos compétences en design et branding.
                Complétez un parcours complet et réalisez un projet pratique pour valider vos acquis.
              </p>
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                  <span>Reconnaissance professionnelle</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span>+ 500 certifiés</span>
                </div>
              </div>
              <Button>En savoir plus</Button>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-blue-100 flex items-center justify-center">
                <Badge className="text-xl p-4 bg-blue-500">CERTIFIED</Badge>
              </div>
            </div>
          </div>
        </PageSection>
      </PageContainer>

      <Separator className="my-8" />
      
      <div className="bg-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Besoin d'aide avec les cours ?</h2>
            <p className="text-muted-foreground">
              Notre équipe pédagogique est disponible pour vous accompagner dans votre parcours d'apprentissage.
            </p>
          </div>
          <Button variant="outline">Contacter un formateur</Button>
        </div>
      </div>
    </AuroraBackground>
  );
} 