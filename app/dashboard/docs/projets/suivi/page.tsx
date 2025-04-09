"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import {
  MessageSquare,
  FileText,
  Clock,
  Bell,
  Users,
  Smartphone,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  XCircle,
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Cycle de vie d'un projet",
    href: "/dashboard/docs/projets/cycle-vie",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Validation des livrables",
    href: "/dashboard/docs/projets/validation",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Questions fréquentes",
    href: "/dashboard/docs/faq",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Types de communication
type CommunicationType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  when: string[];
  how: string;
};

const communicationTypes: CommunicationType[] = [
  {
    id: "suivi",
    title: "Suivi de projet",
    description: "Mises à jour régulières sur l'avancement de votre projet.",
    icon: <ClipboardList className="h-6 w-6" />,
    when: [
      "Lors des changements d'étape du projet",
      "À des jalons prédéfinis dans le calendrier du projet",
      "Après le traitement des retours client"
    ],
    how: "Automatiquement disponible dans votre tableau de bord et par email"
  },
  {
    id: "questions",
    title: "Questions et clarifications",
    description: "Lorsque nous avons besoin d'informations supplémentaires pour avancer.",
    icon: <MessageCircle className="h-6 w-6" />,
    when: [
      "Pendant la phase de briefing",
      "Lorsque certains éléments ne sont pas clairs",
      "Si nous rencontrons des problèmes techniques"
    ],
    how: "Via l'espace commentaires du projet ou par email"
  },
  {
    id: "retours",
    title: "Demande de retours",
    description: "Lorsque nous avons besoin de vos commentaires sur le travail réalisé.",
    icon: <RefreshCw className="h-6 w-6" />,
    when: [
      "Après la livraison des premiers concepts",
      "Suite à des modifications majeures",
      "Avant la finalisation du projet"
    ],
    how: "Notification par email avec lien vers l'interface de révision"
  },
  {
    id: "alerte",
    title: "Alertes et problèmes",
    description: "Communication concernant des retards potentiels ou des problèmes.",
    icon: <Bell className="h-6 w-6" />,
    when: [
      "En cas de retard prévisible",
      "Si des ressources supplémentaires sont nécessaires",
      "Lorsqu'un problème technique survient"
    ],
    how: "Email prioritaire et notification dans le tableau de bord"
  },
  {
    id: "livraison",
    title: "Notification de livraison",
    description: "Lorsque vos fichiers sont prêts à être téléchargés.",
    icon: <CheckCircle className="h-6 w-6" />,
    when: [
      "À la fin du projet",
      "Pour des livrables intermédiaires",
      "Après validation des dernières révisions"
    ],
    how: "Email et notification dans le tableau de bord avec lien de téléchargement"
  }
];

export default function ProjectMonitoringPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "dashboard", title: "Tableau de bord", level: 2 },
      { id: "communications", title: "Types de communication", level: 2 },
      ...communicationTypes.map((type) => ({
        id: type.id,
        title: type.title,
        level: 3,
      })),
      { id: "feedback", title: "Donner des retours efficaces", level: 2 },
      { id: "channels", title: "Canaux de communication", level: 2 },
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
            <h1 id="suivi-communication" className="text-3xl font-bold tracking-tight mb-2">
              Suivi et communication
            </h1>
            <p className="text-lg text-muted-foreground">
              Comment suivre l'avancement de votre projet et communiquer efficacement avec notre équipe.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Une communication transparente
            </h2>
            <p>
              Chez Klyra Design, nous privilégions une communication claire et régulière tout au long de votre projet. Chaque service que nous proposons inclut un système de suivi et de communication conçu pour vous tenir informé à chaque étape et faciliter nos échanges.
            </p>
            <p>
              Notre approche de la communication repose sur trois principes fondamentaux :
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Transparence</strong> - Vous êtes toujours informé de l'état d'avancement de votre projet.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Accessibilité</strong> - Notre équipe est facilement joignable pour répondre à vos questions.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Réactivité</strong> - Nous nous engageons à répondre à vos messages dans un délai de 24 heures ouvrées.</span>
              </li>
            </ul>
          </section>

          <section id="dashboard" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Votre tableau de bord personnalisé
            </h2>
            <p>
              Le tableau de bord est votre espace central pour suivre tous vos projets Klyra. Il vous offre une vision claire et instantanée de l'état d'avancement de chaque projet.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-6 space-y-4 bg-white/50">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Statut en temps réel</h3>
                </div>
                <p className="text-muted-foreground">
                  Visualisez l'état actuel de vos projets et leur progression dans le cycle de développement. Chaque changement de statut est mis à jour en temps réel.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-4 bg-white/50">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Calendrier prévisionnel</h3>
                </div>
                <p className="text-muted-foreground">
                  Consultez les dates importantes de votre projet, y compris les échéances prévues pour les livrables et les sessions de révision.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-4 bg-white/50">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Communication centralisée</h3>
                </div>
                <p className="text-muted-foreground">
                  Toutes les communications liées à votre projet sont accessibles depuis un seul endroit. Consultez l'historique complet de vos échanges avec notre équipe.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-4 bg-white/50">
                <div className="flex items-center">
                  <Bell className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Notifications personnalisées</h3>
                </div>
                <p className="text-muted-foreground">
                  Restez informé des mises à jour importantes grâce à notre système de notifications. Paramétrez vos préférences pour recevoir les alertes qui vous intéressent.
                </p>
              </div>
            </div>

            <div className="mt-6 p-5 border rounded-lg bg-primary/5">
              <h3 className="font-semibold flex items-center mb-3">
                <Users className="h-5 w-5 text-primary mr-2" />
                Accès partagé pour votre équipe
              </h3>
              <p className="text-muted-foreground">
                Vous pouvez partager l'accès à vos projets avec les membres de votre équipe. Chaque collaborateur invité peut consulter l'avancement du projet et participer aux échanges, selon les permissions que vous lui accordez.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/docs/team-access">
                  <Button variant="outline" size="sm">
                    En savoir plus sur la gestion d'équipe
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="communications" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Types de communication pendant votre projet
            </h2>
            <p>
              Différents types de communications interviennent à chaque étape de votre projet. Comprendre leur nature vous aidera à anticiper nos échanges et à y répondre efficacement.
            </p>

            {communicationTypes.map((type) => (
              <div key={type.id} id={type.id} className="border rounded-lg p-6 space-y-4 mt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-lg mr-4">
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{type.title}</h3>
                    <p className="text-muted-foreground">{type.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Quand l'attendre</h4>
                    <ul className="space-y-2">
                      {type.when.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Comment y accéder</h4>
                    <p className="text-muted-foreground">{type.how}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section id="feedback" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Donner des retours efficaces
            </h2>
            <p>
              Vos retours sont essentiels pour la réussite de votre projet. Voici quelques conseils pour nous communiquer vos impressions de manière efficace et constructive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  À faire
                </h3>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Être spécifique et précis dans vos commentaires
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Expliquer pourquoi un élément ne fonctionne pas selon vous
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Prioriser vos retours par ordre d'importance
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Mentionner également les éléments que vous appréciez
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Utiliser notre interface de commentaires pour pointer des zones précises
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  À éviter
                </h3>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Faire des commentaires vagues ("Je n'aime pas ça")
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Envoyer des retours partiels en plusieurs fois
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Attendre plusieurs jours avant de répondre
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Modifier fondamentalement la direction en fin de projet
                  </li>
                  <li className="text-muted-foreground flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Communiquer par différents canaux simultanément
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 mt-4 border rounded-lg bg-primary/5">
              <h3 className="font-semibold">Notre outil de révision</h3>
              <p className="text-muted-foreground mt-2">
                Notre interface de révision vous permet de laisser des commentaires directement sur les maquettes et designs. Vous pouvez pointer des zones précises, dessiner, et même suggérer des modifications avec notre outil intégré.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/docs/outils/revision">
                  <Button variant="outline" size="sm">
                    Guide de l'outil de révision
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="channels" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Canaux de communication disponibles
            </h2>
            <p>
              Nous proposons plusieurs canaux de communication pour vous permettre d'interagir avec notre équipe selon vos préférences et la nature de vos demandes.
            </p>

            <div className="space-y-4 mt-6">
              <div className="flex items-start p-4 border rounded-lg">
                <Mail className="h-6 w-6 text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground mt-1">
                    Pour les communications officielles et les échanges détaillés. Toutes les communications par email sont automatiquement archivées dans votre tableau de bord.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Délai de réponse typique :</strong> 12-24 heures ouvrées
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 border rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold">Messagerie intégrée</h3>
                  <p className="text-muted-foreground mt-1">
                    Pour les échanges rapides et les questions concernant un projet spécifique. Accessible directement depuis la page de votre projet dans le tableau de bord.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Délai de réponse typique :</strong> 4-8 heures ouvrées
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 border rounded-lg">
                <Smartphone className="h-6 w-6 text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold">Appels planifiés</h3>
                  <p className="text-muted-foreground mt-1">
                    Pour les discussions complexes ou les présentations. Vous pouvez réserver un créneau avec votre chef de projet directement depuis votre tableau de bord.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Disponibilité :</strong> Sur rendez-vous, selon le calendrier de disponibilité
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 mt-4 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-blue-800 flex items-center">
                <Bell className="h-5 w-5 text-blue-600 mr-2" />
                Besoin d'une réponse urgente ?
              </h3>
              <p className="text-blue-700 mt-2">
                Pour les questions urgentes nécessitant une attention immédiate, utilisez l'option "Priorité urgente" disponible dans la messagerie intégrée. Cela notifiera immédiatement votre chef de projet.
              </p>
              <p className="text-blue-700 mt-2 text-sm">
                <strong>Note :</strong> Veuillez réserver cette option aux véritables urgences pour garantir son efficacité.
              </p>
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/projets/cycle-vie"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Cycle de vie d'un projet
              </Link>
              <Link
                href="/dashboard/docs/projets/validation"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Validation des livrables →
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