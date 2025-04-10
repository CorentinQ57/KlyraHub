"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import {
  FileText,
  CheckCircle,
  MessageSquare,
  Clock,
  Calendar,
  Zap,
  Lightbulb,
  Pencil,
  Package,
  RefreshCw,
  ThumbsUp,
  CheckSquare,
  Rocket,
  Users,
  Award,
  Bell,
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Validation des livrables",
    href: "/dashboard/docs/projets/validation",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Suivi et communication",
    href: "/dashboard/docs/projets/suivi",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Questions fréquentes",
    href: "/dashboard/docs/faq",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Phases du cycle de vie du projet
type ProjectPhase = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  keyPoints: string[];
  clientActions: string[];
};

const projectPhases: ProjectPhase[] = [
  {
    id: "discovery",
    title: "Découverte & Briefing",
    description: "Phase initiale où nous comprenons vos besoins, objectifs et contexte spécifique.",
    icon: <Lightbulb className="h-6 w-6" />,
    keyPoints: [
      "Collecte d'informations détaillées sur votre projet",
      "Définition des objectifs principaux et des attentes",
      "Analyse du marché cible et des concurrents",
      "Élaboration du cahier des charges"
    ],
    clientActions: [
      "Fournir un briefing détaillé",
      "Partager des exemples d'inspiration",
      "Clarifier vos attentes et besoins spécifiques",
      "Valider le cahier des charges"
    ]
  },
  {
    id: "concept",
    title: "Conceptualisation",
    description: "Développement des premiers concepts créatifs basés sur le briefing.",
    icon: <Pencil className="h-6 w-6" />,
    keyPoints: [
      "Exploration de plusieurs directions créatives",
      "Présentation des premiers concepts",
      "Développement des éléments visuels clés",
      "Définition de l'approche stratégique"
    ],
    clientActions: [
      "Examiner les concepts proposés",
      "Fournir des retours détaillés",
      "Choisir la direction créative à développer",
      "Valider le concept final"
    ]
  },
  {
    id: "production",
    title: "Production",
    description: "Création des livrables finaux selon le concept validé.",
    icon: <Package className="h-6 w-6" />,
    keyPoints: [
      "Développement complet des éléments du projet",
      "Application cohérente de l'identité visuelle",
      "Optimisation pour différentes plateformes et supports",
      "Tests et contrôle qualité"
    ],
    clientActions: [
      "Rester disponible pour des questions ponctuelles",
      "Fournir les ressources additionnelles nécessaires",
      "Suivre l'avancement via le tableau de bord"
    ]
  },
  {
    id: "review",
    title: "Révision & Affinement",
    description: "Phase de retours et ajustements pour perfectionner le résultat.",
    icon: <RefreshCw className="h-6 w-6" />,
    keyPoints: [
      "Présentation des livrables pour évaluation",
      "Collecte et analyse de vos retours",
      "Application des modifications demandées",
      "Optimisation des détails"
    ],
    clientActions: [
      "Examiner attentivement les livrables",
      "Fournir des retours précis et constructifs",
      "Valider les modifications apportées",
      "Approuver les versions finales"
    ]
  },
  {
    id: "completion",
    title: "Livraison & Clôture",
    description: "Finalisation du projet et transmission des livrables définitifs.",
    icon: <Rocket className="h-6 w-6" />,
    keyPoints: [
      "Préparation des fichiers définitifs",
      "Livraison dans tous les formats requis",
      "Documentation technique si nécessaire",
      "Session de transfert des connaissances"
    ],
    clientActions: [
      "Télécharger et sauvegarder tous les fichiers livrés",
      "Confirmer la réception des livrables",
      "Compléter le formulaire de satisfaction",
      "Partager votre expérience (témoignage)"
    ]
  }
];

// Facteurs de succès
type SuccessFactor = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const successFactors: SuccessFactor[] = [
  {
    id: "communication",
    title: "Communication claire",
    description: "Une communication transparente et régulière est essentielle pour maintenir l'alignement entre vos attentes et notre travail.",
    icon: <MessageSquare className="h-6 w-6" />
  },
  {
    id: "commitment",
    title: "Engagement mutuel",
    description: "Votre implication active et notre dévouement professionnel forment le socle d'une collaboration réussie.",
    icon: <Users className="h-6 w-6" />
  },
  {
    id: "flexibility",
    title: "Flexibilité adaptative",
    description: "La capacité à s'adapter aux changements et imprévus permet d'optimiser le résultat final.",
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "timeliness",
    title: "Respect des délais",
    description: "Le respect des échéances par toutes les parties garantit une progression fluide du projet.",
    icon: <Clock className="h-6 w-6" />
  },
  {
    id: "excellence",
    title: "Exigence de qualité",
    description: "Notre engagement pour l'excellence et votre regard critique assurent un résultat à la hauteur de vos ambitions.",
    icon: <Award className="h-6 w-6" />
  }
];

export default function ProjectLifecyclePage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "phases", title: "Les phases du projet", level: 2 },
      ...projectPhases.map((phase) => ({
        id: phase.id,
        title: phase.title,
        level: 3,
      })),
      { id: "timeline", title: "Chronologie indicative", level: 2 },
      { id: "success-factors", title: "Facteurs de réussite", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
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
            <h1 id="cycle-vie-projet" className="text-3xl font-bold tracking-tight mb-2">
              Cycle de vie d'un projet
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprendre les étapes clés de votre projet et leur déroulement chez Klyra Design.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Un parcours structuré vers l'excellence
            </h2>
            <p>
              Chez Klyra Design, chaque projet suit un cycle de vie bien défini, conçu pour garantir des résultats de qualité tout en maintenant une expérience client optimale. Cette méthodologie éprouvée nous permet d'avancer de manière efficace et transparente.
            </p>
            <p>
              Cette page vous présente les différentes phases que traversera votre projet, depuis la découverte initiale jusqu'à la livraison finale. Comprendre ce processus vous aidera à mieux anticiper votre rôle à chaque étape et à maximiser la valeur de notre collaboration.
            </p>
            <div className="relative rounded-xl overflow-hidden mt-6">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border rounded-xl">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-2">À retenir</h3>
                    <p className="text-sm text-muted-foreground">
                      Bien que tous nos services suivent ce cycle de vie général, la durée et l'intensité de chaque phase peuvent varier selon la nature et l'ampleur de votre projet. Votre tableau de bord vous indiquera toujours précisément à quelle étape se trouve votre projet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="phases" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Les phases du projet
            </h2>
            <p>
              Votre projet traversera 5 phases principales, chacune avec ses objectifs spécifiques et ses livrables. À chaque étape, votre participation active est précieuse pour garantir un résultat final parfaitement aligné avec vos attentes.
            </p>

            {projectPhases.map((phase) => (
              <div key={phase.id} id={phase.id} className="border rounded-lg p-6 space-y-5 bg-white/50 mt-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    {phase.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{phase.title}</h3>
                </div>
                <p>{phase.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="font-medium text-primary mb-3">Points clés</h4>
                    <ul className="space-y-2">
                      {phase.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <CheckSquare className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-1" />
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-3">Votre rôle</h4>
                    <ul className="space-y-2">
                      {phase.clientActions.map((action, index) => (
                        <li key={index} className="flex items-start">
                          <CheckSquare className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-1" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section id="timeline" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Chronologie indicative
            </h2>
            <p>
              La durée de chaque phase varie en fonction de la complexité du projet et du service choisi. Voici une répartition indicative du temps consacré à chaque étape pour un projet standard :
            </p>

            <div className="w-full bg-white/50 rounded-lg border p-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Découverte & Briefing</div>
                  <div className="w-3/4 relative">
                    <div className="h-4 bg-primary/10 rounded-full">
                      <div className="h-4 bg-primary rounded-l-full" style={{ width: "15%" }}></div>
                    </div>
                    <span className="absolute -top-6 right-0 text-sm text-muted-foreground">15%</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Conceptualisation</div>
                  <div className="w-3/4 relative">
                    <div className="h-4 bg-primary/10 rounded-full">
                      <div className="h-4 bg-primary rounded-l-full" style={{ width: "25%" }}></div>
                    </div>
                    <span className="absolute -top-6 right-0 text-sm text-muted-foreground">25%</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Production</div>
                  <div className="w-3/4 relative">
                    <div className="h-4 bg-primary/10 rounded-full">
                      <div className="h-4 bg-primary rounded-l-full" style={{ width: "35%" }}></div>
                    </div>
                    <span className="absolute -top-6 right-0 text-sm text-muted-foreground">35%</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Révision & Affinement</div>
                  <div className="w-3/4 relative">
                    <div className="h-4 bg-primary/10 rounded-full">
                      <div className="h-4 bg-primary rounded-l-full" style={{ width: "20%" }}></div>
                    </div>
                    <span className="absolute -top-6 right-0 text-sm text-muted-foreground">20%</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/4 font-medium">Livraison & Clôture</div>
                  <div className="w-3/4 relative">
                    <div className="h-4 bg-primary/10 rounded-full">
                      <div className="h-4 bg-primary rounded-l-full" style={{ width: "5%" }}></div>
                    </div>
                    <span className="absolute -top-6 right-0 text-sm text-muted-foreground">5%</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                <Calendar className="h-4 w-4 inline mr-1" /> La durée totale d'un projet varie généralement de 2 à 6 semaines selon sa complexité et sa portée. Votre devis et contrat spécifient le calendrier exact prévu pour votre projet.
              </p>
            </div>
          </section>

          <section id="success-factors" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Les facteurs de réussite
            </h2>
            <p>
              Pour maximiser les chances de succès de votre projet, certains facteurs clés doivent être pris en compte tout au long du cycle de vie. Ces éléments contribuent significativement à la qualité du résultat final.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {successFactors.map((factor) => (
                <div key={factor.id} className="border rounded-lg p-5 bg-white/50">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      {factor.icon}
                    </div>
                    <h3 className="font-semibold">{factor.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="conclusion" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Prêt à commencer votre voyage ?
            </h2>
            <p>
              Maintenant que vous comprenez le cycle de vie de votre projet, vous êtes mieux équipé pour collaborer efficacement avec notre équipe. Cette compréhension mutuelle du processus nous aidera à créer ensemble un résultat exceptionnel qui répond pleinement à vos objectifs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild>
                <Link href="/dashboard/marketplace">
                  Explorer nos services
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/docs/projets/suivi">
                  Découvrir le suivi de projet
                </Link>
              </Button>
            </div>
          </section>
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