"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { docCategories } from "@/components/docs/DocsNav";
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container';
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
    icon: <Mail className="h-4 w-4 text-[#467FF7]" />,
  },
  {
    title: "FAQ",
    href: "/dashboard/docs/faq",
    description: "Questions fréquemment posées",
    icon: <HelpCircle className="h-4 w-4 text-[#467FF7]" />,
  },
];

const resourceLinks: LinkItem[] = [
  {
    title: "Conditions d'utilisation",
    href: "/dashboard/docs/legal/conditions",
    icon: <FileText className="h-4 w-4 text-[#467FF7]" />,
  },
  {
    title: "Politique de confidentialité",
    href: "/dashboard/docs/legal/confidentialite",
    icon: <ShieldCheck className="h-4 w-4 text-[#467FF7]" />,
  },
  {
    title: "Site Klyra Design",
    href: "https://klyra.design",
    description: "Visitez notre site principal",
    icon: <ExternalLink className="h-4 w-4 text-[#467FF7]" />,
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
    <PageContainer>
      <PageHeader
        title="Documentation"
        description="Bienvenue dans la documentation complète de Klyra Design"
      >
        <div className="flex flex-row gap-4">
          <Link href="/dashboard/docs/premiers-pas">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Débuter avec Klyra
            </Button>
          </Link>
          <Link href="/dashboard/marketplace">
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Explorer les services
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Contenu principal */}
        <div className="flex-1">
          <PageSection title="Catégories de documentation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {docCategories.map((category) => (
                <ContentCard key={category.title} className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#467FF7]">{category.icon}</span>
                    <h3 className="text-[16px] font-semibold">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.slice(0, 3).map((item) => (
                      <li key={item.href}>
                        <Link 
                          href={item.href}
                          className="text-[14px] text-[#64748B] hover:text-[#1A2333] flex items-center"
                        >
                          <span className="mr-1 text-[#467FF7]">•</span> {item.title}
                          {item.badge && (
                            <span className="ml-2 text-xs bg-[#EBF2FF] text-[#467FF7] rounded-full px-2 py-0.5">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                    {category.items.length > 3 && (
                      <li className="text-[13px] text-[#64748B]">
                        + {category.items.length - 3} autres...
                      </li>
                    )}
                  </ul>
                </ContentCard>
              ))}
            </div>
          </PageSection>

          <PageSection title="Comment utiliser cette documentation">
            <ContentCard>
              <p className="text-[14px] mb-4">
                Notre documentation est conçue pour vous aider à tirer le meilleur parti des services Klyra Design. Voici comment elle est organisée :
              </p>
              <ul className="space-y-2 list-disc list-inside text-[#64748B] text-[14px]">
                <li>
                  <strong className="text-[#1A2333]">Navigation latérale</strong> : Accédez à toutes les sections de la documentation.
                </li>
                <li>
                  <strong className="text-[#1A2333]">Table des matières</strong> : Naviguez rapidement dans le contenu de la page actuelle.
                </li>
                <li>
                  <strong className="text-[#1A2333]">Liens rapides</strong> : Accédez aux ressources les plus importantes.
                </li>
              </ul>
              <p className="mt-4 text-[14px]">
                Si vous avez besoin d'aide supplémentaire, n'hésitez pas à contacter notre équipe de support.
              </p>
            </ContentCard>
          </PageSection>

          <PageSection title="Documents récemment mis à jour">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ContentCard>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#467FF7]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Link 
                      href="/dashboard/docs/services/livrables"
                      className="font-medium hover:text-[#467FF7] text-[14px]"
                    >
                      Guide des livrables et formats
                    </Link>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      Types de livrables selon les projets et formats acceptés
                    </p>
                    <div className="flex items-center mt-2 text-xs text-[#64748B]">
                      <Clock className="h-3 w-3 mr-1" />
                      Mis à jour il y a 2 jours
                    </div>
                  </div>
                </div>
              </ContentCard>
              <ContentCard>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#467FF7]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Link 
                      href="/dashboard/docs/compte/facturation"
                      className="font-medium hover:text-[#467FF7] text-[14px]"
                    >
                      Système de facturation
                    </Link>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      Comprendre vos factures et méthodes de paiement
                    </p>
                    <div className="flex items-center mt-2 text-xs text-[#64748B]">
                      <Clock className="h-3 w-3 mr-1" />
                      Mis à jour il y a 5 jours
                    </div>
                  </div>
                </div>
              </ContentCard>
            </div>
          </PageSection>
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
    </PageContainer>
  );
} 