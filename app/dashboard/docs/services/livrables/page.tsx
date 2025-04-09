"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import {
  ArrowRight,
  FileText,
  CheckCircle,
  FileCheck,
  PenTool,
  FileImage,
  FileCode,
  Upload,
  Download,
  Archive,
  Mail,
  ShoppingCart,
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Catalogue de services",
    href: "/dashboard/docs/services/catalogue",
    icon: <ShoppingCart className="h-4 w-4 text-primary" />,
  },
  {
    title: "Processus de validation",
    href: "/dashboard/docs/projets/validation",
    icon: <CheckCircle className="h-4 w-4 text-primary" />,
  },
  {
    title: "Cycle de vie d'un projet",
    href: "/dashboard/docs/projets/cycle-vie",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Définition des types de livrables
type DeliverableFormat = {
  id: string;
  title: string;
  description: string;
  formats: string[];
  icon: React.ReactNode;
  usage: string;
};

// Types de livrables par catégorie
const deliverableFormats: DeliverableFormat[] = [
  {
    id: "design-graphique",
    title: "Design Graphique",
    description: "Formats standards pour les éléments de design graphique et d'identité visuelle.",
    icon: <FileImage className="h-6 w-6 text-primary" />,
    formats: [
      "AI (Adobe Illustrator) - Fichiers sources pour les logos et illustrations vectorielles",
      "PSD (Adobe Photoshop) - Fichiers sources pour les designs complexes et retouches photo",
      "PDF - Format de présentation finale pour impression et partage",
      "PNG - Format d'image avec transparence pour utilisation web",
      "JPG - Format d'image compressé pour utilisation web et présentations",
      "SVG - Format vectoriel pour utilisation web et redimensionnement sans perte de qualité"
    ],
    usage: "Les fichiers sources (AI, PSD) vous permettent de modifier les éléments par la suite, tandis que les formats d'export (PDF, PNG, JPG, SVG) sont prêts à être utilisés dans vos communications."
  },
  {
    id: "web-design",
    title: "Web Design",
    description: "Formats pour les maquettes et prototypes de sites web et applications.",
    icon: <PenTool className="h-6 w-6 text-primary" />,
    formats: [
      "Figma - Fichiers de design collaboratifs avec prototypes interactifs",
      "XD (Adobe XD) - Fichiers de maquettes et prototypes",
      "Sketch - Fichiers sources pour les designs d'interface",
      "HTML/CSS - Maquettes fonctionnelles pour prévisualisation directe dans le navigateur",
      "PDF interactif - Documentation interactive des maquettes et flux utilisateurs"
    ],
    usage: "Les maquettes sont livrées avec accès aux fichiers sources, ce qui vous permet de consulter tous les éléments de design (grilles, styles, composants) et de partager facilement avec votre équipe technique."
  },
  {
    id: "developpement",
    title: "Développement Web",
    description: "Livraison de code et d'applications fonctionnelles.",
    icon: <FileCode className="h-6 w-6 text-primary" />,
    formats: [
      "Code source (GitHub/GitLab) - Accès complet au code source via un dépôt Git",
      "Fichiers d'application - Ensemble des fichiers nécessaires au fonctionnement de l'application",
      "Documentation technique - Guide d'implémentation et de maintenance",
      "Base de données - Structure et données initiales si applicable",
      "API Documentation - Documentation des endpoints et méthodes disponibles"
    ],
    usage: "Le code source est livré avec une documentation claire pour permettre à votre équipe technique de prendre en main le projet facilement. Nous proposons également des sessions de transfert de connaissances pour garantir une transition fluide."
  },
  {
    id: "strategie-marketing",
    title: "Stratégie & Marketing",
    description: "Documents stratégiques et livrables pour vos campagnes marketing.",
    icon: <FileCheck className="h-6 w-6 text-primary" />,
    formats: [
      "DOCX/PDF - Rapports détaillés et plans stratégiques",
      "XLSX - Tableaux d'analyse, plannings et suivis de performance",
      "PPTX - Présentations et rapports visuels",
      "Trello/Asana - Planifications et suivis de projets",
      "Google Analytics/Data Studio - Dashboards de suivi des performances"
    ],
    usage: "Les documents stratégiques sont accompagnés d'explications claires et de recommandations concrètes pour vous permettre de mettre en œuvre les stratégies proposées de manière autonome."
  },
  {
    id: "archives-transfert",
    title: "Archives & Transfert",
    description: "Modalités de livraison et d'archivage des projets terminés.",
    icon: <Archive className="h-6 w-6 text-primary" />,
    formats: [
      "ZIP/RAR - Archives compressées de tous les fichiers du projet",
      "Google Drive/Dropbox - Partage via cloud avec structure de dossiers organisée",
      "WeTransfer - Transfert temporaire pour les fichiers volumineux",
      "FTP - Transfert direct sur votre serveur si nécessaire",
      "Clé USB/Disque dur - Livraison physique pour les projets très volumineux (sur demande)"
    ],
    usage: "Tous les projets sont archivés pendant une durée minimale de 12 mois après livraison, vous permettant d'accéder à nouveau aux fichiers en cas de besoin. Des options d'archivage prolongé sont disponibles sur demande."
  }
];

export default function DeliverablesFormatsPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: "introduction", title: "Introduction", level: 2 },
      ...deliverableFormats.map((format) => ({
        id: format.id,
        title: format.title,
        level: 2,
      })),
      { id: "validation-reception", title: "Validation et réception", level: 2 },
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
            <h1 id="livrables" className="text-3xl font-bold tracking-tight mb-2">
              Livrables et formats
            </h1>
            <p className="text-lg text-muted-foreground">
              Guide complet des formats de fichiers et livrables fournis dans le cadre de nos prestations.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Comprendre nos livrables
            </h2>
            <p>
              Pour chaque projet, nous définissons clairement les livrables attendus dès la phase initiale. Cela garantit 
              une compréhension mutuelle de ce qui sera produit et livré à la fin du projet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Download className="h-5 w-5 text-primary mr-2" />
                    Accès aux fichiers sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Nous vous fournissons toujours les fichiers sources modifiables pour vous garantir une autonomie complète.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    Formats standardisés
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Tous nos livrables sont fournis dans des formats professionnels et universellement compatibles.
                </CardContent>
              </Card>
            </div>
          </section>

          {deliverableFormats.map((format) => (
            <section key={format.id} id={format.id} className="space-y-4 pt-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center">
                {format.icon}
                <span className="ml-2">{format.title}</span>
              </h2>
              <p>{format.description}</p>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Formats inclus :</h3>
                <ul className="space-y-2">
                  {format.formats.map((item, index) => (
                    <li key={index} className="flex">
                      <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-2" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Utilisation :</h3>
                <p className="text-muted-foreground">{format.usage}</p>
              </div>
            </section>
          ))}

          <section id="validation-reception" className="space-y-4 pt-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Validation et réception des livrables
            </h2>
            <p>
              Le processus de livraison suit un protocole précis pour garantir votre satisfaction :
            </p>
            <ol className="space-y-3 mt-4">
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">1</span>
                <span className="text-muted-foreground">Livraison des fichiers via notre plateforme sécurisée ou par le moyen de votre choix</span>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">2</span>
                <span className="text-muted-foreground">Période de revue et de validation de 7 jours ouvrés</span>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">3</span>
                <span className="text-muted-foreground">Possibilité de demander des ajustements mineurs dans le cadre du projet initial</span>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">4</span>
                <span className="text-muted-foreground">Validation finale et clôture du projet</span>
              </li>
            </ol>
            
            <div className="bg-accent p-4 rounded-lg mt-6">
              <h3 className="font-medium flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                Besoin d'un format spécifique ?
              </h3>
              <p className="text-muted-foreground mt-2">
                Si vous avez besoin d'un format particulier qui n'est pas mentionné ici, n'hésitez pas à nous le préciser au début du projet.
                Nous nous efforçons toujours de nous adapter à vos exigences techniques.
              </p>
              <Button size="sm" variant="outline" className="mt-4">
                <Link href="/dashboard/support/contact">Contactez-nous</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Barre latérale */}
      <div className="w-full lg:w-64 space-y-6">
        <TableOfContents items={tocItems} />
        <LinkCard links={relatedLinks} title="Ressources liées" />
      </div>
    </div>
  );
} 