"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { docCategories } from "@/components/docs/DocsNav";
import {
  BookOpen,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  Package,
  ShieldCheck,
  CheckCircle,
  Users
} from "lucide-react";

// Exemple de ressources complémentaires
const supportLinks: LinkItem[] = [
  {
    title: "Support client",
    href: "/dashboard/docs/support/contact",
    description: "Notre équipe est disponible pour vous aider",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
  {
    title: "FAQ",
    href: "/dashboard/docs/faq",
    description: "Questions fréquemment posées",
    icon: <HelpCircle className="h-4 w-4 text-primary" />,
  },
];

const resourceLinks: LinkItem[] = [
  {
    title: "Conditions d'utilisation",
    href: "/dashboard/docs/legal/conditions",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Politique de confidentialité",
    href: "/dashboard/docs/legal/confidentialite",
    icon: <ShieldCheck className="h-4 w-4 text-primary" />,
  },
  {
    title: "Site Klyra Design",
    href: "https://klyra.design",
    description: "Visitez notre site principal",
    icon: <ExternalLink className="h-4 w-4 text-primary" />,
    external: true,
  },
];

export default function DocsHomePage() {
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
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 id="introduction" className="text-3xl font-bold tracking-tight">
              Documentation Klyra Design
            </h1>
            <p className="text-lg text-muted-foreground">
              Bienvenue dans la documentation complète de Klyra Design. Découvrez comment utiliser nos services et gérer vos projets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/docs/premiers-pas">
              <Button className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Débuter avec Klyra
              </Button>
            </Link>
            <Link href="/dashboard/marketplace">
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                Explorer les services
              </Button>
            </Link>
          </div>

          <div className="border-b my-6"></div>

          <section id="categories" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Catégories de documentation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {docCategories.map((category) => (
                <Card key={category.title} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <CardTitle className="flex items-center text-base">
                      <span className="mr-2 text-primary">{category.icon}</span>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {category.items.slice(0, 3).map((item) => (
                        <li key={item.href}>
                          <Link 
                            href={item.href}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                          >
                            <span className="mr-1 text-primary">•</span> {item.title}
                            {item.badge && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                      {category.items.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          + {category.items.length - 3} autres...
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="getting-started" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Comment utiliser cette documentation
            </h2>
            <p>
              Notre documentation est conçue pour vous aider à tirer le meilleur parti des services Klyra Design. Voici comment elle est organisée :
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <strong className="text-foreground">Navigation latérale</strong> : Accédez à toutes les sections de la documentation.
              </li>
              <li>
                <strong className="text-foreground">Table des matières</strong> : Naviguez rapidement dans le contenu de la page actuelle.
              </li>
              <li>
                <strong className="text-foreground">Liens rapides</strong> : Accédez aux ressources les plus importantes.
              </li>
            </ul>
            <p className="mt-4">
              Si vous avez besoin d'aide supplémentaire, n'hésitez pas à contacter notre équipe de support.
            </p>
          </section>

          <section id="recently-updated" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Documents récemment mis à jour
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link 
                    href="/dashboard/docs/services/livrables"
                    className="font-medium hover:underline"
                  >
                    Guide des livrables et formats
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Types de livrables selon les projets et formats acceptés
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Mis à jour il y a 2 jours
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link 
                    href="/dashboard/docs/compte/facturation"
                    className="font-medium hover:underline"
                  >
                    Système de facturation
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprendre vos factures et méthodes de paiement
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Mis à jour il y a 5 jours
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Barre latérale droite */}
      <div className="lg:w-64 lg:flex-shrink-0 space-y-6">
        <div className="lg:sticky lg:top-6">
          <TableOfContents items={tocItems} />
          
          <div className="mt-8">
            <LinkCard
              title="Support"
              links={supportLinks}
              className="mb-6"
            />
            
            <LinkCard
              title="Ressources"
              links={resourceLinks}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 