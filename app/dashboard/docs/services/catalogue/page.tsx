'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableOfContents, TocItem } from '@/components/docs/TableOfContents';
import { LinkCard, LinkItem } from '@/components/docs/LinkCard';
import {
  FileText,
  CheckCircle,
  Clock,
  ShoppingCart,
  PenTool,
  Layout,
  Code,
  LineChart,
  BookOpen,
  MessageSquare,
  Zap,
  Monitor,
} from 'lucide-react';

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: 'Processus de livraison',
    href: '/dashboard/docs/services/processus-livraison',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Livrables et formats',
    href: '/dashboard/docs/services/livrables',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Cycle de vie d\'un projet',
    href: '/dashboard/docs/projets/cycle-vie',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Définition des catégories de services
type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  services: Service[];
};

// Définition d'un service
type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  highlights: string[];
};

// Catégories de services
const serviceCategories: ServiceCategory[] = [
  {
    id: 'branding',
    title: 'Identité de marque',
    description: 'Construisez une marque forte et cohérente qui résonne avec votre public cible.',
    icon: <PenTool className="h-6 w-6 text-primary" />,
    services: [
      {
        id: 'logo-design',
        title: 'Création de logo',
        description: 'Un logo unique et mémorable qui incarne l\'essence de votre marque et renforce votre identité visuelle.',
        price: 'À partir de 490€',
        duration: '2-3 semaines',
        highlights: [
          '3 propositions de concepts',
          'Jusqu\'à 3 cycles de révisions',
          'Fichiers sources et formats d\'export',
          'Guide d\'utilisation du logo',
        ],
      },
      {
        id: 'brand-identity',
        title: 'Identité visuelle complète',
        description: 'Une identité de marque cohérente incluant logo, typographie, palette de couleurs et éléments graphiques.',
        price: 'À partir de 990€',
        duration: '3-5 semaines',
        highlights: [
          'Création de logo',
          'Système typographique et palette de couleurs',
          'Éléments graphiques secondaires',
          'Guide de style complet',
          'Applications sur supports essentiels',
        ],
      },
      {
        id: 'brand-refresh',
        title: 'Refonte d\'identité',
        description: 'Modernisez votre marque existante tout en préservant sa reconnaissance et son héritage.',
        price: 'À partir de 790€',
        duration: '2-4 semaines',
        highlights: [
          'Analyse de l\'identité existante',
          'Évolution du logo et des éléments visuels',
          'Mise à jour du guide de style',
          'Adaptation aux supports numériques modernes',
        ],
      },
    ],
  },
  {
    id: 'web-design',
    title: 'Design Web & UI/UX',
    description: 'Créez des expériences digitales engageantes qui convertissent les visiteurs en clients.',
    icon: <Layout className="h-6 w-6 text-primary" />,
    services: [
      {
        id: 'landing-page',
        title: 'Landing Page',
        description: 'Une page d\'atterrissage optimisée pour la conversion, parfaite pour lancer un produit ou service.',
        price: 'À partir de 690€',
        duration: '1-2 semaines',
        highlights: [
          'Design UI/UX optimisé pour la conversion',
          'Structure de contenu persuasive',
          'Compatible mobile et tablette',
          'Maquettes Figma avec prototype interactif',
        ],
      },
      {
        id: 'website-design',
        title: 'Site Web (5-8 pages)',
        description: 'Un site web professionnel et responsive qui présente efficacement votre entreprise et vos services.',
        price: 'À partir de 1490€',
        duration: '3-5 semaines',
        highlights: [
          'Architecture d\'information',
          'Design UI/UX complet',
          'Optimisation mobile-first',
          'Maquettes Figma et prototype interactif',
          'Guide de design pour développeurs',
        ],
      },
      {
        id: 'e-commerce',
        title: 'E-commerce',
        description: 'Une boutique en ligne complète conçue pour maximiser les ventes et offrir une expérience d\'achat fluide.',
        price: 'À partir de 2490€',
        duration: '4-8 semaines',
        highlights: [
          'Architecture produits et panier',
          'Parcours d\'achat optimisé',
          'Fiches produits et catalogues',
          'Maquettes de toutes les pages clés',
          'Système de design complet',
        ],
      },
    ],
  },
  {
    id: 'development',
    title: 'Développement',
    description: 'Transformez vos designs en sites et applications fonctionnels avec nos services de développement.',
    icon: <Code className="h-6 w-6 text-primary" />,
    services: [
      {
        id: 'frontend-dev',
        title: 'Intégration Front-end',
        description: 'Transformation de vos maquettes en code HTML/CSS/JS parfaitement responsive et optimisé.',
        price: 'À partir de 990€',
        duration: '2-3 semaines',
        highlights: [
          'Intégration responsive',
          'Optimisation des performances',
          'Animations et interactions',
          'Compatible avec tous les navigateurs',
          'Code propre et documenté',
        ],
      },
      {
        id: 'cms-implementation',
        title: 'Implémentation CMS',
        description: 'Mise en place d\'un système de gestion de contenu pour vous permettre de gérer votre site facilement.',
        price: 'À partir de 1490€',
        duration: '3-4 semaines',
        highlights: [
          'Installation et configuration',
          'Intégration de votre design',
          'Création de types de contenu personnalisés',
          'Formation à l\'utilisation',
          'Documentation utilisateur',
        ],
      },
      {
        id: 'webapp-dev',
        title: 'Application Web',
        description: 'Développement d\'applications web complètes avec fonctionnalités avancées et back-end personnalisé.',
        price: 'Sur devis',
        duration: '8-12 semaines',
        highlights: [
          'Architecture technique complète',
          'Développement front-end et back-end',
          'Intégration d\'API et services tiers',
          'Tests et assurance qualité',
          'Déploiement et maintenance',
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Stratégie & Marketing',
    description: 'Maximisez l\'impact de votre présence en ligne grâce à des stratégies digitales ciblées et efficaces.',
    icon: <LineChart className="h-6 w-6 text-primary" />,
    services: [
      {
        id: 'brand-strategy',
        title: 'Stratégie de marque',
        description: 'Définissez le positionnement, la voix et la personnalité de votre marque pour vous démarquer de la concurrence.',
        price: 'À partir de 990€',
        duration: '2-3 semaines',
        highlights: [
          'Analyse de marché et concurrentielle',
          'Définition de positionnement',
          'Plateforme de marque',
          'Stratégie de différenciation',
          'Guide de communication',
        ],
      },
      {
        id: 'content-strategy',
        title: 'Stratégie de contenu',
        description: 'Plan stratégique pour créer et diffuser du contenu pertinent qui attire et engage votre audience cible.',
        price: 'À partir de 790€',
        duration: '2-3 semaines',
        highlights: [
          'Audit de contenu existant',
          'Définition des personas',
          'Planification éditoriale',
          'Recommandations SEO',
          'Guide de style rédactionnel',
        ],
      },
      {
        id: 'digital-audit',
        title: 'Audit digital complet',
        description: 'Analyse approfondie de votre présence en ligne avec recommandations concrètes pour l\'améliorer.',
        price: 'À partir de 690€',
        duration: '1-2 semaines',
        highlights: [
          'Analyse du site web et UX',
          'Audit SEO technique',
          'Évaluation des réseaux sociaux',
          'Analyse de la concurrence',
          'Plan d\'action prioritaire',
        ],
      },
    ],
  },
];

export default function ServiceCataloguePage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: 'introduction', title: 'Introduction', level: 2 },
      ...serviceCategories.map((category) => ({
        id: category.id,
        title: category.title,
        level: 2,
      })),
      { id: 'custom-projects', title: 'Projets sur mesure', level: 2 },
      { id: 'how-to-order', title: 'Comment commander', level: 2 },
    ];
    setTocItems(items);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Contenu principal */}
      <div className="flex-1">
        <div className="space-y-10">
          <div>
            <Link
              href="/dashboard/docs"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4"
            >
              ← Retour à la documentation
            </Link>
            <h1 id="catalogue-services" className="text-3xl font-bold tracking-tight mb-2">
              Catalogue de services
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez l'ensemble des services proposés par Klyra Design, leurs spécificités et tarifs.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Nos services design à prix transparent
            </h2>
            <p>
              Chez Klyra Design, nous proposons une gamme complète de services de design et développement adaptés aux besoins des entreprises tech modernes. Chaque service est packagé avec des livrables clairement définis et un prix transparent.
            </p>
            <p>
              Naviguez dans notre catalogue par catégorie pour découvrir les différentes options disponibles et trouver celle qui correspond à vos besoins spécifiques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    Prix tout compris
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Nos tarifs incluent tous les livrables mentionnés, sans frais cachés ni suppléments inattendus.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    Délais garantis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Les délais indiqués sont respectés pour chaque projet, avec une communication transparente sur l'avancement.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Services par catégorie */}
          {serviceCategories.map((category) => (
            <section key={category.id} id={category.id} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {category.title}
                </h2>
              </div>
              <p className="text-muted-foreground">
                {category.description}
              </p>

              <div className="grid grid-cols-1 gap-6 mt-6">
                {category.services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="mb-2 md:mb-0">
                          <span className="text-sm text-muted-foreground">Prix</span>
                          <p className="text-lg font-bold text-primary">{service.price}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Délai indicatif</span>
                          <p className="font-medium">{service.duration}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Ce qui est inclus:</h4>
                        <ul className="space-y-1.5">
                          {service.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-6">
                        <Link href={`/dashboard/marketplace?service=${service.id}`}>
                          <Button className="w-full">
                            Voir ce service
                            <ShoppingCart className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          <section id="custom-projects" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Projets sur mesure
            </h2>
            <p>
              Nous comprenons que certains projets nécessitent une approche personnalisée. Si vous ne trouvez pas exactement ce que vous cherchez dans notre catalogue, nous serions ravis de discuter de vos besoins spécifiques.
            </p>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Pour les projets complexes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contactez-nous pour discuter de votre projet et recevoir un devis personnalisé adapté à vos objectifs et contraintes spécifiques.
                    </p>
                    <Link href="/dashboard/docs/support/contact">
                      <Button variant="outline">
                        Demander un devis
                        <MessageSquare className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Abonnement design mensuel</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pour les entreprises ayant des besoins réguliers en design, nous proposons également des forfaits mensuels avec des heures dédiées.
                    </p>
                    <Link href="/dashboard/docs/services/abonnement">
                      <Button variant="outline">
                        Découvrir les abonnements
                        <Zap className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="how-to-order" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Comment commander un service
            </h2>
            <p>
              Commander un service Klyra Design est simple et rapide. Suivez ces étapes pour démarrer votre projet:
            </p>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Choisissez votre service</h3>
                  <p className="text-sm text-muted-foreground">
                    Parcourez notre catalogue et sélectionnez le service qui correspond à vos besoins.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Procédez au paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    Réglez votre commande en ligne via notre système de paiement sécurisé.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Recevez votre questionnaire de brief</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous vous enverrons un formulaire détaillé pour recueillir toutes les informations nécessaires au projet.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Suivez l'avancement de votre projet</h3>
                  <p className="text-sm text-muted-foreground">
                    Accédez à votre tableau de bord pour suivre chaque étape de votre projet et interagir avec notre équipe.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/dashboard/marketplace">
                <Button className="w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Explorer la marketplace
                </Button>
              </Link>
              <Link href="/dashboard/docs/premiers-pas">
                <Button variant="outline" className="w-full sm:w-auto">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Guide de démarrage
                </Button>
              </Link>
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/services/livrables"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Livrables et formats
              </Link>
              <Link
                href="/dashboard/docs/services/processus-livraison"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Processus de livraison →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Barre latérale */}
      <div className="w-full lg:w-72 lg:flex-none space-y-10">
        <TableOfContents items={tocItems} />
        <LinkCard links={relatedLinks} title="Ressources utiles" />
      </div>
    </div>
  );
} 