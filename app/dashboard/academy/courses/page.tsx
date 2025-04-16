"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Clock, Filter, FileText, PlayCircle, Search, Trophy, Users } from 'lucide-react'

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

// Types
type Course = {
  id: string
  title: string
  description: string
  category: string
  level: 'Débutant' | 'Intermédiaire' | 'Avancé'
  duration: string
  lessons: number
  image: string
  isPopular?: boolean
  isNew?: boolean
}

// Mock Data
const courses: Course[] = [
  {
    id: '1',
    title: 'Fondamentaux du Branding Digital',
    description: 'Apprenez à construire une identité de marque cohérente et impactante pour le digital.',
    category: 'Branding',
    level: 'Débutant',
    duration: '4h 30min',
    lessons: 12,
    image: '/images/academy/branding-course.jpg',
    isPopular: true
  },
  {
    id: '2',
    title: "Design d'Interface Utilisateur Avancé",
    description: 'Maîtrisez les techniques avancées de design UI pour créer des interfaces exceptionnelles.',
    category: 'Design',
    level: 'Avancé',
    duration: '8h 15min',
    lessons: 24,
    image: '/images/academy/ui-design-course.jpg',
    isNew: true
  },
  {
    id: '3',
    title: 'Développement Frontend avec React',
    description: 'Construisez des interfaces modernes et réactives avec React et les dernières technologies web.',
    category: 'Développement',
    level: 'Intermédiaire',
    duration: '12h 45min',
    lessons: 36,
    image: '/images/academy/react-course.jpg'
  },
  {
    id: '4',
    title: 'Stratégie de Design pour Startups',
    description: 'Apprenez à développer une stratégie de design efficace pour votre startup avec des ressources limitées.',
    category: 'Design',
    level: 'Intermédiaire',
    duration: '5h 20min',
    lessons: 15,
    image: '/images/academy/startup-design-course.jpg'
  },
  {
    id: '5',
    title: "Principes de l'UX Design",
    description: "Découvrez les fondamentaux de l'expérience utilisateur et comment créer des produits centrés sur l'utilisateur.",
    category: 'Design',
    level: 'Débutant',
    duration: '6h 10min',
    lessons: 18,
    image: '/images/academy/ux-design-course.jpg',
    isPopular: true
  },
  {
    id: '6',
    title: 'Marketing Digital pour Designers',
    description: 'Comment utiliser les compétences en design pour améliorer les stratégies de marketing digital.',
    category: 'Branding',
    level: 'Intermédiaire',
    duration: '7h 30min',
    lessons: 22,
    image: '/images/academy/marketing-course.jpg'
  }
]

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  // Filtrer les cours en fonction des critères
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase() === selectedLevel.toLowerCase()
    
    const matchesCategory = activeTab === 'all' || course.category.toLowerCase() === activeTab.toLowerCase()
    
    return matchesSearch && matchesLevel && matchesCategory
  })

  // Composant pour la carte de cours
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        {course.image ? (
          <div className="relative h-full w-full">
            <Image
              src={course.image}
              alt={course.title}
              width={500}
              height={300}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {course.isPopular && (
            <Badge variant="secondary" className="bg-amber-500 text-white">
              Populaire
            </Badge>
          )}
          {course.isNew && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              Nouveau
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
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{course.description}</p>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-gray-400" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4 text-gray-400" />
            <span>{course.lessons} leçons</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <PlayCircle className="mr-2 h-4 w-4" />
          Commencer le cours
        </Button>
      </CardFooter>
    </Card>
  )

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

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="développement">Développement</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {filteredCourses.length > 0 ? (
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
  )
} 