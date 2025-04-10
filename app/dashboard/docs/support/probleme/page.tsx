"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import DocHeader from "@/components/docs/DocHeader";
import DocSection from "@/components/docs/DocSection";
import DocNote from "@/components/docs/DocNote";
import { 
  FileText, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Bug,
  Shield,
  Clock,
  RefreshCw,
  Smartphone,
  Globe,
  Laptop,
  MessageSquare
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Contacter le support",
    href: "/dashboard/docs/support/contact",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
  {
    title: "FAQ",
    href: "/dashboard/docs/faq",
    icon: <MessageSquare className="h-4 w-4 text-primary" />,
  },
];

// Conversion du format pour DocHeader qui attend href et label
const formattedRelatedLinks = relatedLinks.map(link => ({
  href: link.href,
  label: link.title
}));

export default function ProblemReportPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "types", title: "Types de problèmes", level: 2 },
    { id: "report-steps", title: "Comment signaler un problème", level: 2 },
    { id: "browser-info", title: "Informations techniques à fournir", level: 2 },
    { id: "resolution", title: "Processus de résolution", level: 2 },
    { id: "urgent", title: "Problèmes urgents", level: 2 },
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <DocHeader
        title="Rapporter un problème"
        description="Découvrez comment signaler efficacement un problème et obtenir de l'aide rapidement."
        tableOfContents={tocItems}
        relatedLinks={formattedRelatedLinks}
      />

      <DocSection id="introduction" title="Introduction" icon={AlertTriangle}>
        <p className="mb-4">
          Malgré tous nos efforts pour vous offrir une expérience parfaite, il est possible que vous rencontriez occasionnellement des problèmes lors de l'utilisation de nos services. Cette page vous guide sur la façon de signaler efficacement ces problèmes pour que notre équipe puisse les résoudre rapidement.
        </p>
        <p>
          Un signalement précis et détaillé nous aide à identifier et à corriger les problèmes plus rapidement, améliorant ainsi l'expérience pour vous et tous nos utilisateurs.
        </p>
      </DocSection>

      <DocSection id="types" title="Types de problèmes" icon={Bug}>
        <p className="mb-4">
          Différents types de problèmes peuvent survenir lors de l'utilisation de Klyra Design. Voici les catégories les plus courantes :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Bug className="h-5 w-5 text-primary mr-2" />
                Bugs techniques
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Problèmes qui empêchent le fonctionnement normal de la plateforme :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Pages qui ne chargent pas</li>
                <li>Erreurs lors de la soumission de formulaires</li>
                <li>Fonctionnalités qui ne répondent pas</li>
                <li>Problèmes d'affichage ou d'interface</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Problèmes de compte et de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Questions liées à votre compte utilisateur :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Difficultés de connexion</li>
                <li>Problèmes d'authentification</li>
                <li>Questions de confidentialité</li>
                <li>Activité suspecte</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <RefreshCw className="h-5 w-5 text-primary mr-2" />
                Problèmes de traitement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Difficultés avec les processus de service :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Commandes non traitées correctement</li>
                <li>Projets bloqués à une étape</li>
                <li>Problèmes de facturation ou de paiement</li>
                <li>Livraisons retardées ou incorrectes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <MessageSquare className="h-5 w-5 text-primary mr-2" />
                Suggestions et améliorations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Idées pour améliorer nos services :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Nouvelles fonctionnalités souhaitées</li>
                <li>Améliorations de l'interface utilisateur</li>
                <li>Suggestions pour de nouveaux services</li>
                <li>Modifications des processus existants</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocSection>

      <DocSection id="report-steps" title="Comment signaler un problème" icon={CheckCircle}>
        <p className="mb-4">
          Pour nous aider à résoudre rapidement votre problème, veuillez suivre ces étapes :
        </p>

        <ol className="space-y-4 mt-4">
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">1</span>
            <div>
              <h3 className="font-medium">Identifiez précisément le problème</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Notez exactement ce qui ne fonctionne pas, les actions que vous avez effectuées avant que le problème ne survienne, et tout message d'erreur que vous avez pu voir.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">2</span>
            <div>
              <h3 className="font-medium">Rassemblez les informations techniques</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Notez votre navigateur, votre système d'exploitation, l'appareil utilisé, et si possible, faites une capture d'écran du problème.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">3</span>
            <div>
              <h3 className="font-medium">Contactez notre support</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Utilisez notre <Link href="/dashboard/docs/support/contact" className="text-primary hover:underline">formulaire de contact</Link> ou envoyez un email à support@klyra.design en incluant toutes les informations recueillies.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">4</span>
            <div>
              <h3 className="font-medium">Suivez votre signalement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vous recevrez un numéro de suivi qui vous permettra de consulter l'état de résolution de votre problème.
              </p>
            </div>
          </li>
        </ol>

        <DocNote className="mt-6">
          Plus les informations que vous fournissez sont précises, plus nous pouvons résoudre rapidement votre problème. N'hésitez pas à être détaillé dans votre description.
        </DocNote>
      </DocSection>

      <DocSection id="browser-info" title="Informations techniques à fournir" icon={Laptop}>
        <p className="mb-4">
          Pour les problèmes techniques, ces informations nous aident à reproduire et résoudre le problème :
        </p>

        <div className="space-y-4 mt-4">
          <div className="border rounded-lg p-4 flex items-start">
            <Laptop className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Navigateur et version</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ex: Chrome 98.0.4758.102, Firefox 97.0.1, Safari 15.3, etc.
              </p>
              <p className="text-sm mt-2">
                Pour connaître votre version de navigateur, tapez "about:" dans la barre d'adresse de la plupart des navigateurs.
              </p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex items-start">
            <Globe className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Système d'exploitation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ex: Windows 11, macOS Monterey, iOS 15.3, Android 12, etc.
              </p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex items-start">
            <Smartphone className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Appareil utilisé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ex: Desktop, iPhone 13, Samsung Galaxy S21, iPad Pro, etc.
              </p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Messages d'erreur</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Copiez exactement tout message d'erreur affiché à l'écran. Les captures d'écran sont également très utiles.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection id="resolution" title="Processus de résolution" icon={Clock}>
        <p className="mb-4">
          Voici comment nous traitons les problèmes signalés :
        </p>

        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="font-medium">Notre processus de traitement</h3>
          </div>
          <div className="divide-y">
            <div className="p-4 flex items-start">
              <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">1</span>
              <div>
                <h4 className="font-medium">Accusé de réception</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous confirmons la réception de votre signalement dans les 24 heures ouvrables.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-start">
              <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">2</span>
              <div>
                <h4 className="font-medium">Évaluation et catégorisation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous analysons le problème pour déterminer sa nature et sa gravité.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-start">
              <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">3</span>
              <div>
                <h4 className="font-medium">Investigation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Notre équipe technique tente de reproduire et d'identifier la cause du problème.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-start">
              <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">4</span>
              <div>
                <h4 className="font-medium">Résolution</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous développons et déployons une solution, que ce soit une correction immédiate ou une mise à jour planifiée.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-start">
              <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">5</span>
              <div>
                <h4 className="font-medium">Notification</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous vous informons de la résolution et des mesures prises pour éviter que le problème ne se reproduise.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DocNote className="mt-6">
          <p className="font-medium">Délais de résolution :</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Problèmes critiques : 24-48 heures</li>
            <li>Problèmes majeurs : 3-5 jours ouvrables</li>
            <li>Problèmes mineurs : 5-10 jours ouvrables</li>
            <li>Suggestions d'amélioration : évaluées lors de nos cycles de développement</li>
          </ul>
        </DocNote>
      </DocSection>

      <DocSection id="urgent" title="Problèmes urgents" icon={AlertTriangle}>
        <p className="mb-4">
          Si vous rencontrez un problème critique qui affecte gravement votre activité ou qui concerne la sécurité, veuillez utiliser notre processus accéléré :
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-4">
          <h3 className="font-medium text-red-800 mb-3">Pour les urgences :</h3>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            <li>Appelez notre ligne d'assistance urgente : <span className="font-medium">+33 1 23 45 67 89</span> (disponible 7j/7, 9h-21h)</li>
            <li>Envoyez un email avec "[URGENT]" dans l'objet à <span className="font-medium">urgence@klyra.design</span></li>
            <li>Utilisez le chat en direct sur notre plateforme (lorsque disponible)</li>
          </ul>
          <p className="mt-4 text-sm text-red-700">
            Notre équipe d'intervention rapide prendra en charge votre demande en priorité. Ce canal est réservé aux problèmes véritablement urgents.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Exemples de situations urgentes :</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Problèmes de sécurité ou violation de données potentielle</li>
            <li>Plateforme complètement inaccessible</li>
            <li>Problème empêchant totalement le lancement ou la livraison d'un projet critique</li>
            <li>Problèmes graves de paiement ou de facturation avec impact immédiat</li>
          </ul>
        </div>
      </DocSection>

      <div className="border-t pt-6 mt-10">
        <div className="flex justify-between items-center">
          <Link
            href="/dashboard/docs/support/contact"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            ← Contacter le support
          </Link>
          <Link
            href="/dashboard/docs/faq"
            className="text-sm text-primary hover:text-primary/80 flex items-center"
          >
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
} 