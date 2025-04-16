"use client"

import { useState } from 'react'
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
import { BookOpen, Video, FileText, Award, Clock, Users, Layers, ArrowRight, PlayCircle, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// Types pour les données de l'Academy
type Course = {
  id: string
  title: string
  description: string
  category: string
  level: 'Débutant' | 'Intermédiaire' | 'Avancé'
  duration: string
  lessons: number
  image: string
  popular?: boolean
  new?: boolean
  progress: number
  tags: string[]
}

type Resource = {
  id: string
  title: string
  description: string
  type: 'eBook' | 'Vidéo' | 'Template' | 'Checklist'
  image: string
  downloadLink?: string
}

export default function AcademyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("courses")

  // Données factices pour les cours
  const courses: Course[] = [
    {
      id: 'design-principles',
      title: 'Principes fondamentaux du design',
      description: 'Découvrez les principes de base du design et comment ils s\'appliquent aux interfaces numériques modernes.',
      category: 'Design',
      level: 'Débutant',
      duration: '3h 20min',
      lessons: 12,
      image: '/images/academy/design-principles.jpg',
      popular: true,
      progress: 0,
      tags: ["UX", "UI", "Design"]
    },
    {
      id: 'ui-components',
      title: 'Création de composants UI réutilisables',
      description: 'Apprenez à concevoir et développer des composants UI modulaires et réutilisables pour vos projets.',
      category: 'Développement',
      level: 'Intermédiaire',
      duration: '4h 45min',
      lessons: 15,
      image: '/images/academy/ui-components.jpg',
      progress: 25,
      tags: ["Design", "UI", "Composants"]
    },
    {
      id: 'branding-strategy',
      title: 'Stratégie de marque efficace',
      description: 'Développez une stratégie de marque cohérente qui résonne avec votre public cible.',
      category: 'Branding',
      level: 'Intermédiaire',
      duration: '5h 10min',
      lessons: 18,
      image: '/images/academy/branding-strategy.jpg',
      progress: 75,
      tags: ["Branding", "Marketing", "Stratégie"]
    },
    {
      id: 'figma-advanced',
      title: 'Techniques avancées sur Figma',
      description: 'Maîtrisez les fonctionnalités avancées de Figma pour optimiser votre workflow de design.',
      category: 'Design',
      level: 'Avancé',
      duration: '6h 30min',
      lessons: 22,
      image: '/images/academy/figma-advanced.jpg',
      new: true,
      progress: 0,
      tags: ["Design", "Figma", "Avancé"]
    }
  ]

  // Données factices pour les ressources
  const resources: Resource[] = [
    {
      id: 'ux-principles-ebook',
      title: 'Guide des principes UX essentiels',
      description: 'Un guide complet sur les principes fondamentaux de l\'expérience utilisateur.',
      type: 'eBook',
      image: '/images/academy/ux-ebook.jpg',
      downloadLink: '#'
    },
    {
      id: 'design-system-template',
      title: 'Template de Design System',
      description: 'Un template prêt à l\'emploi pour démarrer votre propre design system.',
      type: 'Template',
      image: '/images/academy/design-system.jpg',
      downloadLink: '#'
    },
    {
      id: 'client-presentation',
      title: 'L\'art de la présentation client',
      description: 'Apprenez à présenter efficacement vos designs aux clients pour maximiser l\'impact.',
      type: 'Vidéo',
      image: '/images/academy/client-presentation.jpg'
    }
  ]

  // Composant pour afficher une carte de cours
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full bg-gray-100">
        {course.image ? (
          <div className="relative h-full w-full">
            <Image 
              src={course.image} 
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
        <div className="absolute top-2 right-2 flex gap-2">
          {course.popular && (
            <Badge className="bg-amber-500">Populaire</Badge>
          )}
          {course.new && (
            <Badge className="bg-blue-500">Nouveau</Badge>
          )}
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs font-normal">
            {course.category}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            {course.level}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-xl">{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{course.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <Layers className="mr-1 h-4 w-4" />
            {course.lessons} leçons
          </div>
        </div>
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
        {resource.image ? (
          <div className="relative h-full w-full">
            <Image 
              src={resource.image} 
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
          variant={resource.downloadLink ? "default" : "outline"}
          className="w-full"
        >
          {resource.downloadLink ? (
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
                    <p className="font-medium">+20 Cours</p>
                    <p className="text-sm text-gray-500">Mis à jour régulièrement</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">+30 Ressources</p>
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
              <Button>Découvrir la communauté</Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline">
                  Voir tous les cours
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(course => course.category === 'Design')
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                }
              </div>
            </TabsContent>
            
            <TabsContent value="development" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(course => course.category === 'Développement')
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                }
              </div>
            </TabsContent>
            
            <TabsContent value="branding" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(course => course.category === 'Branding')
                  .map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                }
              </div>
            </TabsContent>
          </Tabs>
        </PageSection>

        {/* Section des ressources */}
        <PageSection title="Ressources" description="Explorez nos ressources gratuites pour compléter votre apprentissage">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline">
              Voir toutes les ressources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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