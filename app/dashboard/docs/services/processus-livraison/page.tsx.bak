"use client";

<<<<<<< HEAD
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import {
  FileText,
  CheckCircle,
  Clock,
  MessageSquare,
  Calendar,
  Briefcase,
  ArrowRight,
  AlertTriangle,
  Download,
  BarChart
=======
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import DocSection from "@/components/docs/DocSection";
import DocNote from "@/components/docs/DocNote";
import { 
  FileText, 
  ChevronRight,
  CheckCircle,
  Clock,
  Zap,
  MessageSquare,
  FileCheck,
  Medal
>>>>>>> e6b15996cc008009228773ea5e0ad76b5418dfaa
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Catalogue de services",
    href: "/dashboard/docs/services/catalogue",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Livrables et formats",
    href: "/dashboard/docs/services/livrables",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Cycle de vie d'un projet",
    href: "/dashboard/docs/projets/cycle-vie",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

<<<<<<< HEAD
// Structure du processus de livraison
const deliverySteps = [
  {
    id: "commande",
    title: "Commande et confirmation",
    description: "Vous sélectionnez un service et procédez au paiement. Une confirmation automatique vous est envoyée.",
    icon: <Briefcase className="h-6 w-6" />,
    details: [
      "Sélection du service depuis la marketplace",
      "Paiement sécurisé en ligne",
      "Réception d'un email de confirmation",
      "Création automatique du projet dans votre tableau de bord"
    ]
  },
  {
    id: "validation",
    title: "Validation et planification",
    description: "Notre équipe valide votre commande, vous contacte pour clarifier certains points si nécessaire, et planifie le projet.",
    icon: <CheckCircle className="h-6 w-6" />,
    details: [
      "Revue de votre commande par notre équipe",
      "Prise de contact pour éclaircissements si nécessaire",
      "Attribution du projet à un designer ou une équipe",
      "Planification des jalons du projet",
      "Communication du calendrier prévisionnel"
    ]
  },
  {
    id: "brief",
    title: "Brief et recueil d'informations",
    description: "Nous collectons toutes les informations nécessaires pour comprendre parfaitement vos besoins et attentes.",
    icon: <MessageSquare className="h-6 w-6" />,
    details: [
      "Questionnaire détaillé adapté à votre service",
      "Collecte de vos références et exemples",
      "Réunion de lancement (selon le service choisi)",
      "Transfert d'éléments (logo, charte graphique, etc.)",
      "Clarification des objectifs et contraintes"
    ]
  },
  {
    id: "production",
    title: "Production",
    description: "Nos experts travaillent sur votre projet selon le calendrier établi, en vous tenant informé de l'avancement.",
    icon: <BarChart className="h-6 w-6" />,
    details: [
      "Création des premières ébauches",
      "Travail de conception selon le brief",
      "Suivi de l'avancement visible dans votre dashboard",
      "Mises à jour régulières sur le statut du projet",
      "Points d'étape pour les projets complexes"
    ]
  },
  {
    id: "livraison",
    title: "Livraison des premières versions",
    description: "Nous vous présentons les premières versions de vos livrables pour recueillir vos retours.",
    icon: <Download className="h-6 w-6" />,
    details: [
      "Mise à disposition des livrables dans votre espace client",
      "Notification par email et sur la plateforme",
      "Présentation du travail réalisé",
      "Explications sur les choix de conception",
      "Ouverture de la phase de feedback"
    ]
  },
  {
    id: "retours",
    title: "Retours et révisions",
    description: "Vous examinez les livrables et nous faites part de vos commentaires pour d'éventuelles modifications.",
    icon: <ArrowRight className="h-6 w-6" />,
    details: [
      "Interface dédiée pour laisser vos commentaires",
      "Possibilité d'annotations directement sur les livrables",
      "Discussion constructive sur les ajustements nécessaires",
      "Nombre de cycles de révision selon votre forfait",
      "Délai de retour pour chaque cycle"
    ]
  },
  {
    id: "finalisation",
    title: "Finalisation et livraison finale",
    description: "Après vos validations, nous finalisons le projet et vous livrons tous les éléments définitifs.",
    icon: <CheckCircle className="h-6 w-6" />,
    details: [
      "Intégration de tous vos retours validés",
      "Préparation des fichiers dans les formats requis",
      "Contrôle qualité final",
      "Livraison de tous les fichiers sources et livrables",
      "Transfert des droits conformément aux conditions"
    ]
  },
  {
    id: "cloture",
    title: "Clôture et suivi",
    description: "Le projet est clôturé, mais notre relation continue avec un suivi et un support post-livraison.",
    icon: <Calendar className="h-6 w-6" />,
    details: [
      "Archivage organisé de tous vos livrables dans votre espace",
      "Envoi d'un questionnaire de satisfaction",
      "Support technique post-livraison",
      "Conseils d'utilisation des livrables",
      "Opportunités de collaboration future"
    ]
  }
];

export default function DeliveryProcessPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "processus", title: "Le processus de livraison", level: 2 },
    ...deliverySteps.map(step => ({
      id: step.id,
      title: step.title,
      level: 3
    })),
    { id: "delais", title: "Délais de livraison", level: 2 },
    { id: "communication", title: "Communication pendant le processus", level: 2 },
    { id: "best-practices", title: "Bonnes pratiques", level: 2 },
=======
export default function ProcessusLivraisonPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "process-overview", title: "Aperçu du processus", level: 2 },
    { id: "process-details", title: "Les 5 étapes clés", level: 2 },
    { id: "step1", title: "1. Découverte et brief", level: 3 },
    { id: "step2", title: "2. Recherche et stratégie", level: 3 },
    { id: "step3", title: "3. Conception et itération", level: 3 },
    { id: "step4", title: "4. Production et finalisation", level: 3 },
    { id: "step5", title: "5. Livraison et support", level: 3 },
    { id: "communication", title: "Communication et suivi", level: 2 },
>>>>>>> e6b15996cc008009228773ea5e0ad76b5418dfaa
  ]);

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
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Processus de livraison
            </h1>
            <p className="text-lg text-muted-foreground">
<<<<<<< HEAD
              De la commande à la livraison finale, découvrez notre méthodologie structurée pour vous garantir des résultats de qualité.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Notre approche
            </h2>
            <p>
              Chez Klyra Design, nous avons développé un processus de livraison structuré et transparent qui assure un déroulement fluide de votre projet, du début à la fin. Cette méthodologie éprouvée garantit des résultats de qualité, dans les délais prévus.
            </p>
            <p>
              Chaque étape a été conçue pour maximiser la communication, minimiser les malentendus et vous offrir une expérience client exceptionnelle. Que vous commandiez une simple création graphique ou un projet complexe, le même niveau d'attention et de rigueur est appliqué.
            </p>
          </section>

          <section id="processus" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Le processus de livraison en 8 étapes
            </h2>
            <p>
              Notre processus est divisé en 8 étapes clés, chacune conçue pour garantir le succès de votre projet.
            </p>

            <div className="space-y-12 mt-8">
              {deliverySteps.map((step, index) => (
                <div key={step.id} id={step.id} className="relative">
                  {index < deliverySteps.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
                  )}
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-6 text-primary">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <div className="ml-3 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                          Étape {index + 1}
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {step.description}
                      </p>
                      
                      <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Ce qui se passe à cette étape :</h4>
                        <ul className="space-y-1">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start text-sm text-muted-foreground">
                              <ArrowRight className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {step.id === "commande" && (
                        <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                          <p className="text-blue-700 text-sm">
                            <strong>Astuce :</strong> Avant de passer commande, n'hésitez pas à consulter attentivement les descriptions de service pour choisir celui qui correspond le mieux à vos besoins.
                          </p>
                        </div>
                      )}
                      
                      {step.id === "brief" && (
                        <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                          <p className="text-blue-700 text-sm">
                            <strong>Important :</strong> Plus votre brief est détaillé, plus nous pourrons vous livrer un travail qui correspond exactement à vos attentes. Prenez le temps de répondre à toutes les questions du questionnaire.
                          </p>
                        </div>
                      )}
                      
                      {step.id === "retours" && (
                        <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
                          <p className="text-yellow-700 text-sm">
                            <strong>À noter :</strong> Le nombre de cycles de révision dépend du forfait que vous avez choisi. Consultez la page <Link href="/dashboard/docs/projets/validation" className="underline">Validation des livrables</Link> pour plus d'informations.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="delais" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Délais de livraison
            </h2>
            <p>
              Nous nous engageons à respecter des délais précis pour chaque étape du processus. Les délais varient en fonction du type de service et de sa complexité.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Délais par type de service</h3>
              </div>
              <div className="divide-y">
                <div className="p-4 flex items-center">
                  <div className="w-1/2 font-medium">Logo et identité visuelle</div>
                  <div className="w-1/2 text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>7 à 14 jours ouvrés</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="w-1/2 font-medium">Site web (landing page)</div>
                  <div className="w-1/2 text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>14 à 21 jours ouvrés</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="w-1/2 font-medium">Application mobile (design)</div>
                  <div className="w-1/2 text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>21 à 30 jours ouvrés</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="w-1/2 font-medium">Supports marketing</div>
                  <div className="w-1/2 text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>5 à 10 jours ouvrés</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center">
                  <div className="w-1/2 font-medium">Conseil et stratégie</div>
                  <div className="w-1/2 text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span>7 à 14 jours ouvrés</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700">
                    <strong>Important :</strong> Ces délais commencent à partir de la validation de votre commande et de la réception de toutes les informations nécessaires. Ils peuvent être affectés par :
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-700">
                    <li>Des retards dans la fourniture des informations requises</li>
                    <li>Des temps de validation client plus longs que prévus</li>
                    <li>Des demandes de modifications majeures hors scope initial</li>
                    <li>Des périodes de forte activité (annoncées à l'avance)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Options de livraison accélérée</h3>
              <p className="text-muted-foreground mb-4">
                Pour les projets urgents, nous proposons des options de livraison accélérée avec un supplément tarifaire :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="font-medium mb-1">Express (+50%)</div>
                  <p className="text-sm text-muted-foreground">Réduction du délai standard de 30%</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="font-medium mb-1">Prioritaire (+75%)</div>
                  <p className="text-sm text-muted-foreground">Réduction du délai standard de 50%</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="font-medium mb-1">Urgence (+100%)</div>
                  <p className="text-sm text-muted-foreground">Délai minimum possible (selon disponibilité)</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Ces options doivent être sélectionnées au moment de la commande ou discutées avec notre équipe avant le début du projet.
              </p>
            </div>
          </section>

          <section id="communication" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Communication pendant le processus
            </h2>
            <p>
              Une communication claire et régulière est essentielle au succès de votre projet. Voici comment nous restons en contact tout au long du processus.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  Tableau de bord du projet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Votre espace dédié pour suivre l'avancement, consulter les livrables et communiquer avec l'équipe. Toutes les mises à jour et notifications y sont centralisées.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  Messagerie intégrée
                </h3>
                <p className="text-sm text-muted-foreground">
                  Communiquez directement avec votre chef de projet et l'équipe créative via notre messagerie intégrée. Tous les échanges sont conservés et accessibles à tout moment.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  Points d'étape
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pour les projets complexes, nous organisons des points d'étape réguliers par visioconférence ou téléphone pour discuter de l'avancement et recueillir vos retours.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  Notifications automatiques
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications par email et sur la plateforme à chaque étape clé du projet : validation de commande, livraison, demande de retours, etc.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700">
                <strong>Notre engagement :</strong> Nous nous engageons à répondre à toutes vos questions et demandes dans un délai de 24 heures ouvrées maximum. Pour les clients Premium, ce délai est réduit à 8 heures ouvrées.
              </p>
            </div>
          </section>

          <section id="best-practices" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Bonnes pratiques pour un processus fluide
            </h2>
            <p>
              Pour garantir le bon déroulement de votre projet et optimiser les délais de livraison, voici quelques bonnes pratiques à suivre :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Préparez vos éléments à l'avance</h3>
                <p className="text-sm text-muted-foreground">
                  Rassemblez tous les éléments nécessaires (logos, textes, images, références) avant le début du projet pour éviter les retards dans la phase de brief.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Répondez rapidement aux demandes</h3>
                <p className="text-sm text-muted-foreground">
                  Les délais de validation et de réponse de votre part impactent directement le calendrier du projet. Essayez de respecter les délais de feedback suggérés.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Centralisez vos retours</h3>
                <p className="text-sm text-muted-foreground">
                  Plutôt que d'envoyer des retours fragmentés sur plusieurs jours, consolidez tous vos commentaires en une seule fois pour chaque cycle de révision.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Soyez précis dans vos commentaires</h3>
                <p className="text-sm text-muted-foreground">
                  Des retours clairs et spécifiques permettent à nos designers de comprendre exactement ce que vous souhaitez et d'apporter les modifications appropriées.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Impliquez les décideurs dès le début</h3>
                <p className="text-sm text-muted-foreground">
                  Assurez-vous que toutes les parties prenantes importantes sont impliquées dès le début du projet pour éviter des changements majeurs tard dans le processus.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Communiquez tout changement rapidement</h3>
                <p className="text-sm text-muted-foreground">
                  Si vos besoins ou objectifs évoluent en cours de projet, informez-nous immédiatement pour que nous puissions nous adapter et minimiser l'impact sur le calendrier.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  En suivant ces bonnes pratiques, vous contribuez activement à la réussite de votre projet et à la qualité des livrables. Notre objectif commun est de vous fournir un résultat qui dépasse vos attentes, dans les délais prévus.
                </p>
              </div>
            </div>
          </section>
=======
              Découvrez notre processus de livraison en 5 étapes qui garantit des résultats de qualité et une expérience transparente.
            </p>
          </div>

          <DocSection id="introduction" title="Introduction" icon={CheckCircle}>
            <p className="mb-4">
              Chez Klyra Design, nous suivons un processus structuré pour chaque projet, quelle que soit sa taille. Notre méthodologie éprouvée garantit que chaque étape du projet est abordée avec soin, que la communication reste fluide et que les résultats correspondent parfaitement à vos attentes.
            </p>
            <p>
              Ce processus en 5 étapes forme la colonne vertébrale de notre approche et vous guide de la définition initiale du projet jusqu'à la livraison finale et au support post-livraison.
            </p>
          </DocSection>

          <DocSection id="process-overview" title="Aperçu du processus" icon={Clock}>
            <p className="mb-4">
              Notre processus de livraison se compose de 5 étapes clés, chacune avec des objectifs précis et des livrables définis :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <span className="bg-primary/10 text-primary font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">1</span>
                    Découverte
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Comprendre vos besoins et objectifs</p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <span className="bg-primary/10 text-primary font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">2</span>
                    Stratégie
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Analyser et planifier l'approche</p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <span className="bg-primary/10 text-primary font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">3</span>
                    Conception
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Créer et affiner les designs</p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <span className="bg-primary/10 text-primary font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">4</span>
                    Production
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Développer et finaliser</p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <span className="bg-primary/10 text-primary font-medium rounded-full h-5 w-5 flex items-center justify-center mr-2">5</span>
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Fournir et soutenir</p>
                </CardContent>
              </Card>
            </div>

            <DocNote className="mt-6">
              La durée de chaque étape varie selon la complexité et l'ampleur de votre projet. Les délais spécifiques sont indiqués dans la description de chaque service sur notre marketplace.
            </DocNote>
          </DocSection>

          <DocSection id="process-details" title="Les 5 étapes clés" icon={Zap}>
            <p className="mb-4">
              Examinons chaque étape en détail pour comprendre ce qui se passe à chaque phase du projet.
            </p>
          </DocSection>

          <DocSection id="step1" title="1. Découverte et brief" icon={undefined}>
            <div className="border-l-4 border-primary/30 pl-4 ml-2">
              <h4 className="font-medium text-lg mb-3">Ce qui se passe à cette étape</h4>
              <p className="mb-4">
                Cette phase initiale est consacrée à la compréhension approfondie de vos besoins, objectifs et attentes. Nous collectons toutes les informations nécessaires pour façonner un projet qui répond parfaitement à vos exigences.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h5 className="font-medium mb-2">Points clés de cette phase :</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Questionnaire de brief détaillé</p>
                        <p className="text-sm text-muted-foreground">Nous vous envoyons un questionnaire adapté à votre service pour recueillir toutes les informations pertinentes.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Réunion de découverte (optionnelle)</p>
                        <p className="text-sm text-muted-foreground">Pour les projets plus complexes, nous organisons une réunion virtuelle pour approfondir les détails et clarifier les points importants.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Validation des objectifs</p>
                        <p className="text-sm text-muted-foreground">Nous confirmons avec vous les objectifs précis du projet et les critères de réussite.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Collecte des ressources</p>
                        <p className="text-sm text-muted-foreground">Nous rassemblons tous les éléments nécessaires (logo, contenu, identité visuelle existante, etc.).</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h5 className="font-medium mb-2">Ce que vous devez faire</h5>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">Remplir le questionnaire de brief avec le plus de détails possible</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">Partager tous les documents et ressources pertinents</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">Communiquer clairement vos attentes et contraintes</p>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h5 className="font-medium mb-2">Livrables de cette étape</h5>
                <ul>
                  <li className="flex items-center">
                    <FileCheck className="h-4 w-4 text-primary mr-2" />
                    <span>Document de brief finalisé</span>
                  </li>
                  <li className="flex items-center">
                    <FileCheck className="h-4 w-4 text-primary mr-2" />
                    <span>Planning et jalons du projet</span>
                  </li>
                  <li className="flex items-center">
                    <FileCheck className="h-4 w-4 text-primary mr-2" />
                    <span>Confirmation des objectifs et attentes</span>
                  </li>
                </ul>
              </div>
            </div>
          </DocSection>

          <DocSection id="step2" title="2. Recherche et stratégie" icon={undefined}>
            <div className="border-l-4 border-primary/30 pl-4 ml-2">
              <h4 className="font-medium text-lg mb-3">Ce qui se passe à cette étape</h4>
              <p className="mb-4">
                Sur la base des informations recueillies, nous menons des recherches approfondies et développons une stratégie adaptée à votre projet. Cette phase pose les fondations solides sur lesquelles reposera tout le travail créatif.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h5 className="font-medium mb-2">Points clés de cette phase :</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Analyse du marché et de la concurrence</p>
                        <p className="text-sm text-muted-foreground">Nous étudions votre secteur, vos concurrents et les tendances pertinentes.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Définition des personas</p>
                        <p className="text-sm text-muted-foreground">Nous identifions et caractérisons vos audiences cibles pour guider nos décisions de design.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Élaboration de la stratégie</p>
                        <p className="text-sm text-muted-foreground">Nous développons une approche stratégique qui répond à vos objectifs business et de communication.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Planification du projet</p>
                        <p className="text-sm text-muted-foreground">Nous établissons un calendrier détaillé et des jalons pour le reste du projet.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Ce que nous attendons de vous :</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                    <li>Validation des orientations stratégiques proposées</li>
                    <li>Partage d'informations additionnelles si nécessaire</li>
                    <li>Feedback sur les personas et la compréhension du marché</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Résultat de cette étape :</h5>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un document de stratégie qui synthétise notre compréhension, notre approche et le plan pour les phases suivantes. Ce document servira de guide pour toutes les décisions créatives à venir.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          <DocSection id="step3" title="3. Conception et itération" icon={undefined}>
            <div className="border-l-4 border-primary/30 pl-4 ml-2">
              <h4 className="font-medium text-lg mb-3">Ce qui se passe à cette étape</h4>
              <p className="mb-4">
                C'est à cette étape que nous donnons vie à votre projet. Nos designers créent les premières propositions visuelles et les affinent à travers un processus d'itération basé sur vos retours.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h5 className="font-medium mb-2">Points clés de cette phase :</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Création des concepts initiaux</p>
                        <p className="text-sm text-muted-foreground">Nos designers développent plusieurs directions créatives basées sur la stratégie définie.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Présentation des propositions</p>
                        <p className="text-sm text-muted-foreground">Nous vous présentons les concepts créatifs avec les explications des choix de design.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Recueil de feedback</p>
                        <p className="text-sm text-muted-foreground">Nous collectons vos impressions et commentaires sur les propositions.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Itérations et affinements</p>
                        <p className="text-sm text-muted-foreground">Nous affinons les designs selon vos retours jusqu'à obtention du résultat souhaité.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Ce que nous attendons de vous :</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                    <li>Feedback constructif et précis sur les propositions</li>
                    <li>Respect du nombre de cycles de révision prévus dans votre forfait</li>
                    <li>Réactivité dans la validation des étapes</li>
                    <li>Centralisation des retours (éviter les feedbacks multiples et contradictoires)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Résultat de cette étape :</h5>
                  <p className="text-sm text-muted-foreground">
                    À la fin de cette phase, vous disposerez d'un design finalisé qui répond à vos objectifs et reflète votre vision, prêt à entrer en phase de production.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          <DocSection id="step4" title="4. Production et finalisation" icon={undefined}>
            <div className="border-l-4 border-primary/30 pl-4 ml-2">
              <h4 className="font-medium text-lg mb-3">Ce qui se passe à cette étape</h4>
              <p className="mb-4">
                Une fois le design validé, nous entrons dans la phase de production où les éléments approuvés sont développés, intégrés ou finalisés pour préparer la livraison.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h5 className="font-medium mb-2">Points clés de cette phase :</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Développement technique</p>
                        <p className="text-sm text-muted-foreground">Pour les projets web/app, c'est à ce moment que nous codons les interfaces approuvées.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Finalisation des actifs</p>
                        <p className="text-sm text-muted-foreground">Nous préparons tous les fichiers dans les formats requis pour l'utilisation finale.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Tests et contrôle qualité</p>
                        <p className="text-sm text-muted-foreground">Nous testons rigoureusement tous les livrables pour garantir leur qualité et leur fonctionnalité.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Préparation des guides et documentation</p>
                        <p className="text-sm text-muted-foreground">Nous créons la documentation nécessaire pour vous permettre d'utiliser efficacement les livrables.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Ce que nous attendons de vous :</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                    <li>Validation finale des éléments avant production complète</li>
                    <li>Fourniture rapide de tout contenu additionnel requis</li>
                    <li>Disponibilité pour les tests utilisateur si nécessaire</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Résultat de cette étape :</h5>
                  <p className="text-sm text-muted-foreground">
                    Tous les éléments de votre projet sont finalisés, testés et prêts à être livrés selon les spécifications convenues.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          <DocSection id="step5" title="5. Livraison et support" icon={undefined}>
            <div className="border-l-4 border-primary/30 pl-4 ml-2">
              <h4 className="font-medium text-lg mb-3">Ce qui se passe à cette étape</h4>
              <p className="mb-4">
                C'est le moment où vous recevez tous les livrables finaux. Nous vous accompagnons également dans la prise en main et restons disponibles pour vous soutenir après la livraison.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h5 className="font-medium mb-2">Points clés de cette phase :</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Remise des livrables</p>
                        <p className="text-sm text-muted-foreground">Nous vous fournissons tous les fichiers finaux via notre plateforme sécurisée.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Formation et transfert de connaissances</p>
                        <p className="text-sm text-muted-foreground">Selon le projet, nous organisons une session pour vous montrer comment utiliser les livrables.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Période de support</p>
                        <p className="text-sm text-muted-foreground">Nous restons disponibles pendant une période définie pour répondre à vos questions et effectuer des ajustements mineurs.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clôture et évaluation du projet</p>
                        <p className="text-sm text-muted-foreground">Nous recueillons vos impressions sur le projet et le processus pour continuer à nous améliorer.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Ce que nous attendons de vous :</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1">
                    <li>Confirmation de la bonne réception des livrables</li>
                    <li>Participation à la session de transfert si prévue</li>
                    <li>Feedback sur votre satisfaction globale</li>
                    <li>Signalement rapide de tout problème rencontré avec les livrables</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Résultat de cette étape :</h5>
                  <p className="text-sm text-muted-foreground">
                    Vous disposez de tous les éléments nécessaires pour utiliser efficacement le résultat de votre projet, avec la tranquillité d'esprit de savoir que nous sommes là pour vous soutenir.
                  </p>
                </div>
              </div>
            </div>
          </DocSection>

          <DocSection id="communication" title="Communication et suivi" icon={MessageSquare}>
            <p className="mb-4">
              Une communication efficace est au cœur de notre processus. Voici comment nous assurons un suivi transparent tout au long de votre projet :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <MessageSquare className="h-5 w-5 text-primary mr-2" />
                    Mises à jour régulières
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Nous vous tenons informé à chaque étape du projet :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>Notifications à chaque jalon atteint</li>
                    <li>Résumés hebdomadaires pour les projets longs</li>
                    <li>Alertes en cas de besoin d'action de votre part</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <FileCheck className="h-5 w-5 text-primary mr-2" />
                    Documentation complète
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Tous les aspects du projet sont clairement documentés :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>Brief validé et objectifs</li>
                    <li>Décisions prises et leur justification</li>
                    <li>Historique des versions et modifications</li>
                    <li>Guides d'utilisation des livrables</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Medal className="h-5 w-5 text-primary mr-2" />
                    Chef de projet dédié
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Votre point de contact unique pour :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>Répondre à toutes vos questions</li>
                    <li>Coordonner les différentes étapes</li>
                    <li>Garantir la qualité des livrables</li>
                    <li>Assurer le respect des délais</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-2" />
                    Transparence totale
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Nous partageons ouvertement :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>L'avancement réel du projet</li>
                    <li>Tout obstacle ou défi rencontré</li>
                    <li>Les options et alternatives disponibles</li>
                    <li>Les implications de chaque décision</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Link href="/dashboard/docs/projets/suivi">
                <Button variant="outline" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  En savoir plus sur le suivi de projet
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </DocSection>
>>>>>>> e6b15996cc008009228773ea5e0ad76b5418dfaa

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/services/catalogue"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Catalogue de services
              </Link>
              <Link
                href="/dashboard/docs/services/livrables"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Livrables et formats →
              </Link>
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD

      {/* Barre latérale droite */}
      <div className="lg:w-64 lg:flex-shrink-0 space-y-6">
        <div className="lg:sticky lg:top-6">
          <TableOfContents items={tocItems} />
          
          <div className="mt-8">
            <LinkCard
              title="Liens utiles"
              links={relatedLinks}
            />
=======
      
      {/* Barre latérale droite */}
      <div className="hidden lg:block w-64 flex-none">
        <div className="sticky top-16 space-y-10">
          <TableOfContents items={tocItems} />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Liens connexes</h3>
            <LinkCard items={relatedLinks} />
>>>>>>> e6b15996cc008009228773ea5e0ad76b5418dfaa
          </div>
        </div>
      </div>
    </div>
  );
} 