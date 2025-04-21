'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Users, UserPlus, Award, ThumbsUp, Calendar, Globe, Search, Filter } from 'lucide-react';

// Components
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type Community = {
  id: string
  name: string
  description: string
  membersCount: number
  avatar: string
  category: string
  posts?: number
  isPopular?: boolean
  isNew?: boolean
}

type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  host: string
  hostAvatar: string
  attendees: number
  type: 'webinar' | 'workshop' | 'meetup'
}

type Post = {
  id: string
  title: string
  content: string
  author: string
  authorAvatar: string
  authorRole: string
  date: string
  likes: number
  comments: number
  community: string
}

// Mock Data
const communities: Community[] = [
  {
    id: '1',
    name: 'Designers UI/UX',
    description: 'Échangez sur les bonnes pratiques UI/UX et partagez vos designs.',
    membersCount: 2458,
    avatar: '/images/academy/community-1.jpg',
    category: 'Design',
    posts: 128,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Branding Stratégique',
    description: 'Discussions sur les stratégies de marque efficaces et études de cas.',
    membersCount: 1230,
    avatar: '/images/academy/community-2.jpg',
    category: 'Branding',
    posts: 86,
  },
  {
    id: '3',
    name: 'Freelances Design',
    description: 'Entraide pour les designers freelances et partage d\'opportunités.',
    membersCount: 978,
    avatar: '/images/academy/community-3.jpg',
    category: 'Carrière',
    posts: 205,
    isPopular: true,
  },
  {
    id: '4',
    name: 'Design Thinking',
    description: 'Explorez le processus créatif et les méthodes de design thinking.',
    membersCount: 652,
    avatar: '/images/academy/community-4.jpg',
    category: 'Méthodologie',
    posts: 74,
  },
  {
    id: '5',
    name: 'Tendances Web Design 2024',
    description: 'Décryptage des tendances actuelles et à venir en design web.',
    membersCount: 1850,
    avatar: '/images/academy/community-5.jpg',
    category: 'Design',
    posts: 112,
    isNew: true,
  },
  {
    id: '6',
    name: 'Motion Design',
    description: 'Tout sur l\'animation et le motion design pour vos interfaces.',
    membersCount: 746,
    avatar: '/images/academy/community-6.jpg',
    category: 'Animation',
    posts: 93,
  },
];

const events: Event[] = [
  {
    id: '1',
    title: 'Workshop Design System',
    description: 'Apprenez à construire un design system efficace et évolutif pour vos projets.',
    date: '15 Juin 2024',
    time: '14:00 - 16:00',
    host: 'Sophie Martin',
    hostAvatar: '/images/avatars/sophie.jpg',
    attendees: 87,
    type: 'workshop',
  },
  {
    id: '2',
    title: 'Webinaire Tendances UI/UX 2024',
    description: 'Exploration des dernières tendances en design d\'interface et expérience utilisateur.',
    date: '22 Juin 2024',
    time: '11:00 - 12:30',
    host: 'Thomas Dubois',
    hostAvatar: '/images/avatars/thomas.jpg',
    attendees: 245,
    type: 'webinar',
  },
  {
    id: '3',
    title: 'Meetup Designers Parisiens',
    description: 'Rencontrez d\'autres designers et échangez sur vos expériences et projets.',
    date: '30 Juin 2024',
    time: '18:30 - 21:00',
    host: 'Caroline Lefèvre',
    hostAvatar: '/images/avatars/caroline.jpg',
    attendees: 58,
    type: 'meetup',
  },
];

const posts: Post[] = [
  {
    id: '1',
    title: 'Comment j\'ai optimisé mon processus de design UI',
    content: 'Après plusieurs années à travailler sur des projets complexes, j\'ai développé une méthode qui me permet de gagner un temps précieux...',
    author: 'Julien Dupont',
    authorAvatar: '/images/avatars/julien.jpg',
    authorRole: 'UI Designer Senior',
    date: 'Il y a 2 jours',
    likes: 48,
    comments: 12,
    community: 'Designers UI/UX',
  },
  {
    id: '2',
    title: 'Étude de cas : Refonte de marque pour une startup fintech',
    content: 'Je vous partage aujourd\'hui le processus complet de refonte de marque que j\'ai réalisé pour une startup fintech en pleine croissance...',
    author: 'Marie Lambert',
    authorAvatar: '/images/avatars/marie.jpg',
    authorRole: 'Brand Strategist',
    date: 'Il y a 4 jours',
    likes: 72,
    comments: 23,
    community: 'Branding Stratégique',
  },
  {
    id: '3',
    title: 'Ressources gratuites pour améliorer vos mockups',
    content: 'Voici une compilation des meilleurs outils et ressources gratuites que j\'utilise quotidiennement pour améliorer la présentation de mes designs...',
    author: 'Alexandre Moreau',
    authorAvatar: '/images/avatars/alexandre.jpg',
    authorRole: 'Freelance Designer',
    date: 'Il y a 1 semaine',
    likes: 136,
    comments: 42,
    community: 'Freelances Design',
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrer les communautés en fonction des critères
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || community.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Composant pour la carte de communauté
  const CommunityCard = ({ community }: { community: Community }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={community.avatar} alt={community.name} />
            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {community.name}
              {community.isPopular && (
                <Badge variant="secondary" className="bg-amber-500 text-white text-xs">
                  Populaire
                </Badge>
              )}
              {community.isNew && (
                <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                  Nouveau
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{community.category}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{community.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4 text-gray-400" />
            <span>{community.membersCount} membres</span>
          </div>
          {community.posts && (
            <div className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4 text-gray-400" />
              <span>{community.posts} discussions</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Rejoindre
        </Button>
      </CardFooter>
    </Card>
  );

  // Composant pour la carte d'événement
  const EventCard = ({ event }: { event: Event }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>
              {event.date} • {event.time}
            </CardDescription>
          </div>
          <Badge className={
            event.type === 'workshop' ? 'bg-purple-500' :
              event.type === 'webinar' ? 'bg-blue-500' : 'bg-green-500'
          }>
            {event.type === 'workshop' ? 'Workshop' :
              event.type === 'webinar' ? 'Webinaire' : 'Meetup'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{event.description}</p>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={event.hostAvatar} alt={event.host} />
            <AvatarFallback>{event.host.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{event.host}</p>
            <p className="text-gray-500">Animateur</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="mr-1 h-4 w-4" />
          <span>{event.attendees} participants</span>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          S'inscrire
        </Button>
      </CardFooter>
    </Card>
  );

  // Composant pour la carte de post
  const PostCard = ({ post }: { post: Post }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.authorAvatar} alt={post.author} />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{post.author}</p>
            <p className="text-gray-500">{post.authorRole} • {post.date}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">{post.content}</p>
        <Badge variant="outline" className="mt-2">{post.community}</Badge>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm">
            <ThumbsUp className="mr-1 h-4 w-4 text-gray-400" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center text-sm">
            <MessageSquare className="mr-1 h-4 w-4 text-gray-400" />
            <span>{post.comments}</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Lire la suite
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true} className="relative">
      <PageContainer>
        <PageHeader 
          title="Communauté Klyra" 
          description="Échangez avec d'autres professionnels et participez à des événements exclusifs"
        >
          <Link href="/dashboard/academy">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'Academy
            </Button>
          </Link>
        </PageHeader>

        <PageSection>
          <Tabs defaultValue="communities" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="communities">Communautés</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="posts">Discussions récentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="communities" className="mt-0">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Rechercher une communauté..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <Button variant="outline">
                    <Globe className="mr-2 h-4 w-4" />
                    Créer une communauté
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="mt-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold">Événements à venir</h3>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir le calendrier complet
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              <div className="mt-10">
                <ContentCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-semibold mb-2">Proposer un événement</h3>
                      <p className="text-gray-600 mb-4">
                        Vous souhaitez partager votre expertise avec la communauté ? Proposez un webinaire, 
                        un workshop ou un meetup et nous vous aiderons à l'organiser.
                      </p>
                      <Button>Soumettre une proposition</Button>
                    </div>
                    <div className="md:w-1/3 flex justify-center">
                      <div className="rounded-full bg-white p-6 shadow-sm">
                        <Calendar className="h-20 w-20 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </ContentCard>
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="mt-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold">Discussions récentes</h3>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Nouvelle discussion
                </Button>
              </div>

              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button variant="outline">
                  Voir plus de discussions
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </PageSection>

        <PageSection>
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Programme d'experts Klyra</h2>
                <p className="text-gray-600 mb-6">
                  Devenez un expert reconnu dans notre communauté. Partagez votre expertise, 
                  animez des événements et aidez d'autres membres à progresser.
                </p>
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Badge exclusif</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="rounded-full bg-amber-100 p-2 mr-3">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Visibilité accrue</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Accès privilégié</p>
                    </div>
                  </div>
                </div>
                <Button>Postuler au programme</Button>
              </div>
              <div className="hidden md:flex justify-center">
                <Avatar className="h-36 w-36 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/academy/expert-badge.jpg" alt="Programme d'experts" />
                  <AvatarFallback>
                    <Award className="h-20 w-20 text-blue-500" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </PageSection>
      </PageContainer>

      <Separator className="my-8" />
      
      <div className="bg-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Code de conduite</h2>
            <p className="text-muted-foreground">
              Notre communauté respecte des règles de bienveillance et d'entraide.
              Consultez notre code de conduite pour plus d'informations.
            </p>
          </div>
          <Button variant="outline">Consulter les règles</Button>
        </div>
      </div>
    </AuroraBackground>
  );
} 