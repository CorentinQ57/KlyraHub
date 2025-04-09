"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { 
  ArrowRight, 
  CheckCircle, 
  ExternalLink,
  FileText,
  Users,
  Mail,
  MessageSquare,
  HelpCircle
} from "lucide-react";

// Liens recommandés dans la barre latérale
const recommendedLinks: LinkItem[] = [
  {
    title: "FAQ",
    href: "/dashboard/docs/faq",
    description: "Questions fréquemment posées",
    icon: <HelpCircle className="h-4 w-4 text-primary" />,
  },
  {
    title: "Catalogue de services",
    href: "/dashboard/docs/services/catalogue",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Support client",
    href: "/dashboard/docs/support/contact",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
];

export default function GettingStartedPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const headings = document.querySelectorAll<HTMLHeadingElement>('h2, h3');
    const items: TocItem[] = Array.from(headings).map((heading) => ({
      id: heading.id,
      title: heading.textContent || "",
      level: parseInt(heading.tagName.substring(1)),
    }));
    setTocItems(items);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Contenu principal */}
      <div className="flex-1">
        <div className="space-y-8">
          <div>
            <Link
              href="/dashboard/docs"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4"
            >
              ← Retour à la documentation
            </Link>
            <h1 id="premiers-pas" className="text-3xl font-bold tracking-tight mb-2">
              Premiers pas avec Klyra Design
            </h1>
            <p className="text-lg text-muted-foreground">
              Un guide complet pour débuter avec nos services et tirer le meilleur parti de notre plateforme.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Introduction
            </h2>
            <p>
              Bienvenue chez Klyra Design ! Nous sommes ravis de vous accompagner dans vos projets digitaux. Cette page vous guidera à travers les premières étapes pour utiliser efficacement notre plateforme.
            </p>
            <p>
              Klyra Design est une agence spécialisée en design, branding et stratégie digitale. Notre plateforme vous permet de :
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-muted-foreground">
              <li>Découvrir et acheter nos services de design packagés</li>
              <li>Suivre l'avancement de vos projets en temps réel</li>
              <li>Communiquer facilement avec notre équipe</li>
              <li>Accéder à vos livrables et ressources</li>
            </ul>
          </section>

          <section id="etape-1" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Étape 1 : Explorer notre catalogue de services
            </h2>
            <p>
              La première étape consiste à explorer notre catalogue de services pour trouver celui qui correspond le mieux à vos besoins. Chaque service inclut une description détaillée, le prix, le délai de livraison et les livrables inclus.
            </p>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-muted">
              <h3 id="comment-explorer" className="text-lg font-medium mb-2">
                Comment explorer notre catalogue
              </h3>
              <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                <li>Cliquez sur <strong>Marketplace</strong> dans le menu principal</li>
                <li>Utilisez les filtres pour affiner votre recherche (catégorie, prix, etc.)</li>
                <li>Cliquez sur un service pour voir ses détails complets</li>
                <li>Consultez les exemples et les spécifications</li>
              </ol>
            </div>

            <div className="flex mt-4">
              <Link href="/dashboard/marketplace">
                <Button variant="outline" className="flex items-center">
                  Explorer la marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          <section id="etape-2" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Étape 2 : Commander un service
            </h2>
            <p>
              Une fois que vous avez trouvé le service qui vous convient, vous pouvez passer commande directement via notre plateforme. Le processus est simple et sécurisé.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card className="p-4 bg-muted/20">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-3">
                  1
                </div>
                <h3 className="font-medium mb-1">Sélectionner</h3>
                <p className="text-sm text-muted-foreground">
                  Choisissez le service qui répond à vos besoins
                </p>
              </Card>
              <Card className="p-4 bg-muted/20">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-3">
                  2
                </div>
                <h3 className="font-medium mb-1">Payer</h3>
                <p className="text-sm text-muted-foreground">
                  Effectuez le paiement via notre système sécurisé
                </p>
              </Card>
              <Card className="p-4 bg-muted/20">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-3">
                  3
                </div>
                <h3 className="font-medium mb-1">Suivre</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez votre projet dans votre dashboard
                </p>
              </Card>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
              <h3 id="bon-a-savoir" className="flex items-center text-lg font-medium text-yellow-800 mb-2">
                <CheckCircle className="mr-2 h-5 w-5 text-yellow-600" />
                Bon à savoir
              </h3>
              <p className="text-yellow-700">
                Après votre achat, un projet est automatiquement créé et notre équipe est notifiée. Vous recevrez une confirmation par email avec tous les détails.
              </p>
            </div>
          </section>

          <section id="etape-3" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Étape 3 : Suivre votre projet
            </h2>
            <p>
              Une fois votre commande passée, vous pouvez suivre l'avancement de votre projet directement depuis votre dashboard. Vous verrez l'évolution de votre projet à travers 5 étapes :
            </p>
            
            <ol className="space-y-4 mt-4">
              <li className="flex">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
                  1
                </div>
                <div>
                  <h3 id="en-attente" className="font-medium">En attente de validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Notre équipe examine votre commande et vérifie toutes les informations
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
                  2
                </div>
                <div>
                  <h3 id="projet-valide" className="font-medium">Projet validé</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre projet a été validé et intégré à notre planning de production
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
                  3
                </div>
                <div>
                  <h3 id="en-cours" className="font-medium">En cours de réalisation</h3>
                  <p className="text-sm text-muted-foreground">
                    Nos designers travaillent activement sur votre projet
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
                  4
                </div>
                <div>
                  <h3 id="livrables" className="font-medium">Livrables disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    Les livrables sont prêts et disponibles pour téléchargement
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-3">
                  5
                </div>
                <div>
                  <h3 id="termine" className="font-medium">Projet terminé</h3>
                  <p className="text-sm text-muted-foreground">
                    Le projet est complet et archivé, mais reste accessible
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section id="communication" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Communication avec notre équipe
            </h2>
            <p>
              La communication est essentielle pour la réussite de votre projet. Vous pouvez communiquer avec notre équipe de plusieurs façons :
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Commentaires de projet</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Laissez des commentaires directement sur la page de votre projet pour des questions ou retours spécifiques.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Support par email</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contactez notre équipe de support pour toute question générale ou assistance.
                </p>
              </div>
            </div>
          </section>

          <section id="ressources-supplementaires" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Ressources supplémentaires
            </h2>
            <p>
              Voici quelques ressources supplémentaires pour vous aider à tirer le meilleur parti de Klyra Design :
            </p>
            
            <ul className="space-y-2 mt-4">
              <li>
                <Link 
                  href="/dashboard/docs/faq"
                  className="flex items-center text-primary hover:text-primary/80"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Consultez notre FAQ pour les questions courantes
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/docs/services/catalogue"
                  className="flex items-center text-primary hover:text-primary/80"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Explorez notre catalogue de services détaillé
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/docs/projets/cycle-vie"
                  className="flex items-center text-primary hover:text-primary/80"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  En savoir plus sur le cycle de vie d'un projet
                </Link>
              </li>
            </ul>
          </section>

          <div className="border-t pt-6 mt-8">
            <div className="flex justify-between items-center">
              <Link 
                href="/dashboard/docs"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Documentation
              </Link>
              <Link 
                href="/dashboard/docs/faq"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Questions fréquentes →
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
              title="Recommandé"
              links={recommendedLinks}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 