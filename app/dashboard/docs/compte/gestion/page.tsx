"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import {
  FileText,
  User,
  Settings,
  Lock,
  Mail,
  Bell,
  Key,
  UserPlus,
  UserMinus,
  X,
  Check,
  AlertTriangle,
  Shield,
  BadgeInfo,
  Share2
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Facturation",
    href: "/dashboard/docs/compte/facturation",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Modes de paiement",
    href: "/dashboard/docs/compte/paiement",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Politique de confidentialité",
    href: "/dashboard/docs/legal/confidentialite",
    icon: <Shield className="h-4 w-4 text-primary" />,
  },
];

// Définition des sections de gestion de compte
type AccountSection = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
};

const accountSections: AccountSection[] = [
  {
    id: "profile",
    title: "Informations personnelles",
    description: "Gérez vos informations de profil et vos préférences de contact.",
    icon: <User className="h-6 w-6 text-primary" />,
    features: [
      "Modifier votre nom et prénom",
      "Mettre à jour votre photo de profil",
      "Changer votre adresse email",
      "Mettre à jour votre numéro de téléphone",
      "Gérer vos coordonnées postales"
    ]
  },
  {
    id: "security",
    title: "Sécurité et authentification",
    description: "Protégez votre compte avec des options de sécurité avancées.",
    icon: <Lock className="h-6 w-6 text-primary" />,
    features: [
      "Modifier votre mot de passe",
      "Activer l'authentification à deux facteurs (2FA)",
      "Consulter l'historique des connexions",
      "Gérer les appareils connectés",
      "Révoquer les sessions actives"
    ]
  },
  {
    id: "notifications",
    title: "Préférences de notification",
    description: "Personnalisez les alertes et communications que vous recevez.",
    icon: <Bell className="h-6 w-6 text-primary" />,
    features: [
      "Notifications par email",
      "Notifications dans l'application",
      "Alertes de projet",
      "Bulletins d'information et mises à jour",
      "Rappels et échéances"
    ]
  },
  {
    id: "team",
    title: "Gestion d'équipe",
    description: "Invitez et gérez les membres de votre équipe ayant accès à vos projets.",
    icon: <UserPlus className="h-6 w-6 text-primary" />,
    features: [
      "Inviter de nouveaux membres",
      "Attribuer des rôles et permissions",
      "Gérer l'accès aux projets",
      "Suivre l'activité des membres",
      "Supprimer des utilisateurs"
    ]
  },
  {
    id: "data",
    title: "Données et confidentialité",
    description: "Contrôlez vos données personnelles et gérez votre vie privée.",
    icon: <Shield className="h-6 w-6 text-primary" />,
    features: [
      "Télécharger vos données personnelles",
      "Gérer les consentements",
      "Supprimer des informations spécifiques",
      "Comprendre comment vos données sont utilisées",
      "Désactiver certaines fonctionnalités de suivi"
    ]
  },
  {
    id: "account-status",
    title: "Statut du compte",
    description: "Gérez l'état de votre compte et effectuez des opérations importantes.",
    icon: <Settings className="h-6 w-6 text-primary" />,
    features: [
      "Mettre à jour le type de compte",
      "Suspendre temporairement votre compte",
      "Réactiver un compte suspendu",
      "Supprimer définitivement votre compte",
      "Consulter les limitations actuelles"
    ]
  }
];

export default function AccountManagementPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: "introduction", title: "Introduction", level: 2 },
      ...accountSections.map((section) => ({
        id: section.id,
        title: section.title,
        level: 2,
      })),
      { id: "data-protection", title: "Protection des données", level: 2 },
      { id: "account-deletion", title: "Suppression de compte", level: 2 },
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
            <h1 id="gestion-compte" className="text-3xl font-bold tracking-tight mb-2">
              Gestion de compte
            </h1>
            <p className="text-lg text-muted-foreground">
              Apprenez à gérer votre compte utilisateur, vos préférences et vos paramètres de sécurité.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Votre compte Klyra Design
            </h2>
            <p>
              Votre compte Klyra Design vous permet de gérer vos projets, accéder à vos livrables et interagir avec notre équipe. Cette section vous guide à travers les différentes options disponibles pour personnaliser et sécuriser votre compte.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Key className="h-5 w-5 text-primary mr-2" />
                    Accès centralisé
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Un seul compte pour accéder à tous vos projets, factures et communications avec notre équipe.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Share2 className="h-5 w-5 text-primary mr-2" />
                    Invitez votre équipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Ajoutez des membres de votre équipe pour collaborer sur les projets tout en gardant le contrôle sur leurs permissions.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Sections de gestion de compte */}
          {accountSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-muted-foreground">
                {section.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {section.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start p-4 border rounded-lg">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{feature}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Link href={`/dashboard/settings#${section.id}`}>
                  <Button variant="outline" size="sm">
                    Accéder aux paramètres {section.title.toLowerCase()}
                  </Button>
                </Link>
              </div>
            </section>
          ))}

          <section id="data-protection" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Protection des données
            </h2>
            <p>
              Chez Klyra Design, nous prenons très au sérieux la protection de vos données personnelles et professionnelles.
            </p>

            <div className="space-y-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    Confidentialité par défaut
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Vos projets et données sont privés par défaut et ne sont accessibles qu'aux personnes que vous avez explicitement autorisées.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nous n'utilisons jamais vos créations ou informations professionnelles comme exemples pour d'autres clients sans votre consentement explicite.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Lock className="h-5 w-5 text-primary mr-2" />
                    Sécurité renforcée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Toutes vos données sont stockées sur des serveurs sécurisés avec chiffrement au repos et en transit.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nous effectuons des audits de sécurité réguliers et suivons les meilleures pratiques de l'industrie pour protéger vos informations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <BadgeInfo className="h-5 w-5 text-primary mr-2" />
                    Transparence totale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Notre politique de confidentialité explique clairement comment nous collectons, utilisons et protégeons vos données.
                  </p>
                  <div className="mt-3">
                    <Link href="/dashboard/docs/legal/confidentialite">
                      <Button variant="outline" size="sm">
                        Consulter notre politique de confidentialité
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="account-deletion" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Suppression de compte
            </h2>
            <p>
              Si vous souhaitez supprimer définitivement votre compte Klyra Design, cette section détaille le processus et ses implications.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-2">Attention</h3>
                  <p className="text-sm text-amber-700">
                    La suppression d'un compte est une action permanente qui ne peut pas être annulée. Toutes vos données personnelles seront effacées de nos systèmes conformément à notre politique de confidentialité.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Téléchargez vos données</h3>
                  <p className="text-sm text-muted-foreground">
                    Avant de supprimer votre compte, nous vous recommandons de télécharger une copie de vos données, y compris vos projets et factures.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Vérifiez vos projets actifs</h3>
                  <p className="text-sm text-muted-foreground">
                    Assurez-vous que tous vos projets sont terminés ou transférés à un autre compte si nécessaire.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Accédez aux paramètres de suppression</h3>
                  <p className="text-sm text-muted-foreground">
                    Dans les paramètres de votre compte, rendez-vous dans la section "Statut du compte" et sélectionnez "Supprimer mon compte".
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Confirmez la suppression</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivez les instructions à l'écran pour confirmer la suppression de votre compte. Une vérification par email ou SMS peut être requise.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-dashed pt-6 mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Besoin d'aide pour votre compte ?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notre équipe support est disponible pour vous assister.
                  </p>
                </div>
                <Link href="/dashboard/docs/support/contact">
                  <Button variant="outline">
                    Contacter le support
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/compte/facturation"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Facturation
              </Link>
              <Link
                href="/dashboard/docs/compte/paiement"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Modes de paiement →
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