"use client";

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
      <div className="hidden lg:block w-64 flex-none">
        <div className="sticky top-16 space-y-10">
          <TableOfContents items={tocItems} />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Liens connexes</h3>
            <LinkCard items={relatedLinks} />
          </div>
        </div>
      </div>
    </div>
  );
} 