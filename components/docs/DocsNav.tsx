"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Compass,
  FileText,
  FileQuestion,
  Settings,
  LifeBuoy,
  Package,
  Users,
  CreditCard,
  CheckCircle
} from "lucide-react";

// Structure des catégories et documents
export type DocItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
};

export type DocCategory = {
  title: string;
  icon: React.ReactNode;
  items: DocItem[];
  expanded?: boolean;
};

// Définition des catégories de documentation
export const docCategories: DocCategory[] = [
  {
    title: "Commencer",
    icon: <Compass className="h-4 w-4" />,
    expanded: true,
    items: [
      {
        title: "Introduction",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Premiers pas",
        href: "/dashboard/docs/premiers-pas",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "FAQ",
        href: "/dashboard/docs/faq",
        icon: <FileQuestion className="h-4 w-4" />,
        badge: "Nouveau",
        badgeColor: "bg-green-100 text-green-800",
      },
    ],
  },
  {
    title: "Services",
    icon: <Package className="h-4 w-4" />,
    items: [
      {
        title: "Catalogue de services",
        href: "/dashboard/docs/services/catalogue",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Processus de livraison",
        href: "/dashboard/docs/services/processus-livraison",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Livrables et formats",
        href: "/dashboard/docs/services/livrables",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Projets",
    icon: <CheckCircle className="h-4 w-4" />,
    items: [
      {
        title: "Cycle de vie d'un projet",
        href: "/dashboard/docs/projets/cycle-vie",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Suivi et communication",
        href: "/dashboard/docs/projets/suivi",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Validation des livrables",
        href: "/dashboard/docs/projets/validation",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Comptes et facturation",
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      {
        title: "Gestion de compte",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
        disabled: true,
        badge: "Bientôt",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
      {
        title: "Facturation",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
        disabled: true,
        badge: "Bientôt",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
      {
        title: "Modes de paiement",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
        disabled: true,
        badge: "Bientôt",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
    ],
  },
  {
    title: "Support",
    icon: <LifeBuoy className="h-4 w-4" />,
    items: [
      {
        title: "Contacter le support",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
        disabled: true,
        badge: "Bientôt",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
      {
        title: "Rapporter un problème",
        href: "/dashboard/docs",
        icon: <FileText className="h-4 w-4" />,
        disabled: true,
        badge: "Bientôt",
        badgeColor: "bg-yellow-100 text-yellow-800",
      },
    ],
  },
];

export function DocsNav() {
  const pathname = usePathname();
  const [categories, setCategories] = useState(docCategories);

  // Mettre à jour l'état d'expansion d'une catégorie
  const toggleCategory = (index: number) => {
    const updatedCategories = [...categories];
    updatedCategories[index].expanded = !updatedCategories[index].expanded;
    setCategories(updatedCategories);
  };

  // Vérifier si un lien est actif
  const isActive = (href: string) => {
    return pathname === href;
  };

  // Vérifier si une catégorie contient le lien actif
  const categoryContainsActive = (category: DocCategory) => {
    return category.items.some((item) => isActive(item.href));
  };

  return (
    <div className="w-full">
      <div className="space-y-1">
        {categories.map((category, index) => (
          <div key={category.title} className="mb-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between font-medium text-sm",
                categoryContainsActive(category)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => toggleCategory(index)}
            >
              <div className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.title}</span>
              </div>
              {category.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {category.expanded && (
              <div className="ml-4 mt-1 space-y-1">
                {category.items.map((item) => (
                  item.disabled ? (
                    <div
                      key={item.href}
                      className="flex items-center justify-between py-1.5 px-3 text-sm rounded-md text-muted-foreground/60 cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          className={cn(
                            "text-xs",
                            item.badgeColor || "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between py-1.5 px-3 text-sm rounded-md",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          className={cn(
                            "text-xs",
                            item.badgeColor || "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 