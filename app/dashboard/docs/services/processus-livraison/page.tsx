"use client";

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

      {/* Barre latérale droite */}
      <div className="lg:w-64 lg:flex-shrink-0 space-y-6">
        <div className="lg:sticky lg:top-6">
          <TableOfContents items={tocItems} />
          
          <div className="mt-8">
            <LinkCard
              title="Liens utiles"
              links={relatedLinks}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 