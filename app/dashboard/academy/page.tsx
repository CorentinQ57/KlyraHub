"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Video, FileText, Award, Clock, Users, Layers, ArrowRight, PlayCircle, Download, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

// Services
import { Course, Resource, getCourses, getResources } from '@/lib/academy-service'

export default function AcademyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Récupère les cours et ressources en parallèle
        const [coursesData, resourcesData] = await Promise.all([
          getCourses(),
          getResources()
        ])
        
        setCourses(coursesData)
        setResources(resourcesData)
      } catch (error) {
        console.error('Erreur lors du chargement des données Academy:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Composant pour afficher une carte de cours
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 w-full bg-gray-100">
        {course.image_url ? (
          <div className="relative h-full w-full">
            <Image 
              src={course.image_url} 
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 space-x-2">
          {course.is_new && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              Nouveau
            </Badge>
          )}
          {course.is_popular && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
              Populaire
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge className={
            course.level === 'Débutant' ? 'bg-green-500' : 
            course.level === 'Intermédiaire' ? 'bg-blue-500' : 'bg-purple-500'
          }>
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription>{course.category}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Layers className="mr-1 h-4 w-4" />
            <span>{course.lessons} leçons</span>
          </div>
        </div>
        
        {user && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span className="font-medium">0%</span>
            </div>
            <Progress value={0} />
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">
          Voir le cours
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  // Composant pour afficher une carte de ressource
  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-40 w-full bg-gray-100">
        {resource.image_url ? (
          <div className="relative h-full w-full">
            <Image 
              src={resource.image_url} 
              alt={resource.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
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

  // Composant pour les squelettes de chargement
  const CardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="h-40 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full" />
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
          title="Klyra Academy" 
          description="Développez vos compétences avec nos formations et ressources exclusives"
        >
          <Link href="/dashboard">
            <Button variant="outline">
              Retour au Dashboard
            </Button>
          </Link>
        </PageHeader>

        {/* Introduction de l'Academy */}
        <PageSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContentCard className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Bienvenue dans Klyra Academy</h2>
              <p className="text-gray-600 mb-4">
                Klyra Academy vous propose des formations et des ressources pour développer vos compétences en design, branding et stratégie digitale. 
                Que vous soyez débutant ou expert, vous trouverez des contenus adaptés à votre niveau.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">+{courses.length} Cours</p>
                    <p className="text-sm text-gray-500">Mis à jour régulièrement</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">+{resources.length} Ressources</p>
                    <p className="text-sm text-gray-500">eBooks, templates, etc.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-amber-100 p-2 mr-3">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Certificats</p>
                    <p className="text-sm text-gray-500">Validez vos compétences</p>
                  </div>
                </div>
              </div>
            </ContentCard>
            <ContentCard className="flex flex-col justify-center items-center text-center p-8">
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Rejoignez la communauté</h3>
              <p className="text-gray-600 mb-6">Connectez-vous avec d'autres professionnels et partagez vos connaissances</p>
              <Link href="/dashboard/academy/community">
                <Button>Découvrir la communauté</Button>
              </Link>
            </ContentCard>
          </div>
        </PageSection>

        {/* Section des cours */}
        <PageSection title="Cours et formations" description="Développez vos compétences avec nos cours exclusifs">
          <Tabs defaultValue="courses" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="courses">Tous</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="development">Développement</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.slice(0, 3).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/dashboard/academy/courses">
                  <Button variant="outline">
                    Voir tous les cours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter(course => course.category === 'Design')
                    .slice(0, 3)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))
                  }
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/dashboard/academy/courses?category=design">
                  <Button variant="outline">
                    Voir tous les cours de design
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="development" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter(course => course.category === 'Développement')
                    .slice(0, 3)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))
                  }
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/dashboard/academy/courses?category=développement">
                  <Button variant="outline">
                    Voir tous les cours de développement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="branding" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter(course => course.category === 'Branding')
                    .slice(0, 3)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))
                  }
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/dashboard/academy/courses?category=branding">
                  <Button variant="outline">
                    Voir tous les cours de branding
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </PageSection>

        {/* Section des ressources */}
        <PageSection title="Ressources" description="Explorez nos ressources gratuites pour compléter votre apprentissage">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/dashboard/academy/resources">
              <Button variant="outline">
                Voir toutes les ressources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageSection>

        {/* Section d'inscription à la newsletter */}
        <PageSection>
          <ContentCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0 md:pr-6">
                <h2 className="text-2xl font-bold mb-2">Restez informé</h2>
                <p className="text-gray-600 mb-4">
                  Abonnez-vous à notre newsletter pour recevoir en avant-première nos nouveaux cours et ressources.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Votre email" 
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button>S'abonner</Button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <BookOpen className="h-24 w-24 text-blue-500 opacity-75" />
              </div>
            </div>
          </ContentCard>
        </PageSection>
      </PageContainer>

      <Separator className="my-8" />
      
      {/* Section d'aide */}
      <div className="bg-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Besoin d'aide avec l'Academy ?</h2>
            <p className="text-muted-foreground">
              Notre équipe est disponible pour vous accompagner dans votre parcours d'apprentissage.
            </p>
          </div>
          <Button variant="outline">Contacter le support</Button>
        </div>
      </div>
    </AuroraBackground>
  )
} 