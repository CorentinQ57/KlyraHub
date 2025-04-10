"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  Scale,
  Users,
  Check,
  X,
  HelpCircle
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Politique de confidentialité",
    href: "/dashboard/docs/legal/confidentialite",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Contacter le support",
    href: "/dashboard/docs/support/contact",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

export default function TermsOfServicePage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "definitions", title: "Définitions", level: 2 },
    { id: "account", title: "Création et gestion de compte", level: 2 },
    { id: "services", title: "Services proposés", level: 2 },
    { id: "content", title: "Contenu et propriété intellectuelle", level: 2 },
    { id: "payment", title: "Paiements et facturation", level: 2 },
    { id: "restrictions", title: "Restrictions et obligations", level: 2 },
    { id: "termination", title: "Résiliation et suspension", level: 2 },
    { id: "warranty", title: "Garanties et responsabilité", level: 2 },
    { id: "changes", title: "Modifications des conditions", level: 2 },
    { id: "legal", title: "Dispositions légales", level: 2 },
    { id: "contact", title: "Nous contacter", level: 2 },
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
              Conditions d'utilisation
            </h1>
            <p className="text-lg text-muted-foreground">
              Dernière mise à jour : 10 avril 2025
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Scale className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h2 className="text-base font-medium text-blue-800">Veuillez lire attentivement</h2>
                <p className="text-sm text-blue-700 mt-1">
                  Les présentes conditions d'utilisation régissent votre utilisation de la plateforme Klyra Design et de tous les services associés. En utilisant notre plateforme, vous acceptez d'être lié par ces conditions.
                </p>
              </div>
            </div>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Introduction
            </h2>
            <p>
              Les présentes conditions d'utilisation (les "Conditions") constituent un accord juridiquement contraignant entre vous, en tant qu'utilisateur de notre plateforme, et Klyra Design ("nous", "notre", "nos"), régissant votre utilisation de notre site web, de nos applications mobiles et de tous les services associés (collectivement, la "Plateforme").
            </p>
            <p>
              En accédant à notre Plateforme ou en l'utilisant de quelque manière que ce soit, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions. Si vous n'acceptez pas ces Conditions, vous ne devez pas accéder à notre Plateforme ni l'utiliser.
            </p>
          </section>

          <section id="definitions" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Définitions
            </h2>
            <p>
              Dans les présentes Conditions, les termes suivants auront la signification qui leur est attribuée ci-dessous :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Plateforme :</span> Le site web de Klyra Design, les applications mobiles et tous les services associés.</li>
              <li><span className="font-medium">Utilisateur :</span> Toute personne qui accède à la Plateforme ou l'utilise, qu'elle soit inscrite ou non.</li>
              <li><span className="font-medium">Compte :</span> Un compte personnel créé par un Utilisateur sur la Plateforme.</li>
              <li><span className="font-medium">Client :</span> Un Utilisateur qui achète ou utilise les services proposés sur la Plateforme.</li>
              <li><span className="font-medium">Designer :</span> Un professionnel du design qui fournit des services via la Plateforme.</li>
              <li><span className="font-medium">Contenu :</span> Tous les textes, images, vidéos, sons, designs, logos, marques, données ou autres matériels présents sur la Plateforme.</li>
              <li><span className="font-medium">Services :</span> Les prestations de design et autres services connexes proposés sur la Plateforme.</li>
              <li><span className="font-medium">Projet :</span> Une mission de design commandée par un Client et réalisée par un Designer via la Plateforme.</li>
            </ul>
          </section>

          <section id="account" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Création et gestion de compte
            </h2>
            <p>
              Pour accéder à certaines fonctionnalités de notre Plateforme, vous devrez créer un Compte. Lors de la création de votre Compte, vous acceptez de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Être entièrement responsable de toutes les activités qui se produisent sous votre Compte</li>
              <li>Nous informer immédiatement de toute utilisation non autorisée de votre Compte</li>
              <li>Ne pas créer plusieurs Comptes ou un Compte au nom d'une autre personne</li>
            </ul>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier votre Compte si nous estimons que vous avez enfreint ces Conditions ou pour toute autre raison à notre seule discrétion.
            </p>
          </section>

          <section id="services" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Services proposés
            </h2>
            <p>
              Klyra Design est une plateforme qui met en relation des Clients avec des Designers professionnels pour la réalisation de projets de design. Nous offrons les services suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mise en relation entre Clients et Designers</li>
              <li>Gestion de projets de design</li>
              <li>Traitement des paiements et facturation</li>
              <li>Communication sécurisée entre les parties</li>
              <li>Stockage et partage de fichiers</li>
              <li>Suivi de l'avancement des projets</li>
            </ul>
            <p>
              Nous agissons en tant qu'intermédiaire facilitant la conclusion de contrats entre les Clients et les Designers. Nous ne sommes pas partie à ces contrats et ne garantissons pas la qualité, la sécurité ou la légalité des Services fournis par les Designers.
            </p>
          </section>

          <section id="content" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Contenu et propriété intellectuelle
            </h2>
            <p>
              <span className="font-medium">Contenu de la Plateforme :</span> Tout le Contenu présent sur notre Plateforme, à l'exception du Contenu généré par les Utilisateurs, est la propriété de Klyra Design ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer, vendre ou louer ce Contenu sans notre autorisation écrite préalable.
            </p>
            <p>
              <span className="font-medium">Contenu des Utilisateurs :</span> En publiant du Contenu sur notre Plateforme, vous :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conservez tous vos droits de propriété intellectuelle sur ce Contenu</li>
              <li>Nous accordez une licence mondiale, non exclusive, gratuite, transférable et pouvant faire l'objet d'une sous-licence pour utiliser, reproduire, modifier, adapter, publier, traduire et distribuer ce Contenu dans le cadre de la fourniture de nos services</li>
              <li>Garantissez que vous avez le droit de publier ce Contenu et qu'il ne viole pas les droits d'un tiers</li>
            </ul>
            <p>
              <span className="font-medium">Livrables des Projets :</span> Les droits de propriété intellectuelle sur les livrables créés dans le cadre d'un Projet sont régis par les conditions spécifiques de ce Projet. En général, le transfert des droits au Client n'a lieu qu'après le paiement intégral des sommes dues.
            </p>
          </section>

          <section id="payment" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Paiements et facturation
            </h2>
            <p>
              En utilisant nos Services, vous acceptez de payer tous les frais applicables. Les conditions de paiement sont les suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les prix des Services sont indiqués sur la Plateforme et peuvent être modifiés à tout moment</li>
              <li>Les paiements sont traités via notre système de paiement sécurisé</li>
              <li>Un acompte peut être requis avant le début d'un Projet</li>
              <li>Nous prélevons une commission sur chaque transaction effectuée via la Plateforme</li>
              <li>Les factures sont générées électroniquement et mises à disposition dans votre Compte</li>
              <li>En cas de retard de paiement, des frais supplémentaires peuvent être appliqués</li>
            </ul>
            <p>
              Vous acceptez de fournir des informations de paiement exactes et complètes. Nous nous réservons le droit de suspendre l'accès aux Services en cas de non-paiement.
            </p>
          </section>

          <section id="restrictions" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Restrictions et obligations
            </h2>
            <p>
              En utilisant notre Plateforme, vous acceptez de ne pas :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utiliser la Plateforme d'une manière qui pourrait endommager, désactiver ou surcharger nos systèmes</li>
              <li>Tenter de contourner nos mesures de sécurité ou d'accéder à des zones non autorisées de la Plateforme</li>
              <li>Publier ou transmettre du Contenu illégal, offensant, diffamatoire, frauduleux ou trompeur</li>
              <li>Violer les droits de propriété intellectuelle d'autrui</li>
              <li>Utiliser la Plateforme pour envoyer des communications non sollicitées</li>
              <li>Collecter des informations sur d'autres Utilisateurs sans leur consentement</li>
              <li>Contourner notre système de paiement pour éviter les commissions</li>
              <li>Usurper l'identité d'une autre personne ou entité</li>
            </ul>
            <p>
              Nous nous réservons le droit de surveiller votre utilisation de la Plateforme pour vérifier le respect de ces Conditions et de prendre des mesures appropriées en cas de violation.
            </p>
          </section>

          <section id="termination" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Résiliation et suspension
            </h2>
            <p>
              <span className="font-medium">Résiliation par l'Utilisateur :</span> Vous pouvez résilier votre Compte à tout moment en suivant les instructions disponibles sur la Plateforme. La résiliation de votre Compte n'affecte pas les Projets en cours, qui restent soumis aux présentes Conditions jusqu'à leur achèvement.
            </p>
            <p>
              <span className="font-medium">Résiliation par Klyra Design :</span> Nous pouvons suspendre ou résilier votre accès à la Plateforme, en tout ou en partie, à tout moment et pour quelque raison que ce soit, sans préavis ni responsabilité, y compris si nous pensons que vous avez violé ces Conditions.
            </p>
            <p>
              <span className="font-medium">Effets de la résiliation :</span> En cas de résiliation, votre droit d'utiliser la Plateforme cessera immédiatement. Les dispositions qui, par leur nature, devraient survivre à la résiliation, resteront en vigueur.
            </p>
          </section>

          <section id="warranty" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Garanties et responsabilité
            </h2>
            <p>
              <span className="font-medium">Aucune garantie :</span> La Plateforme est fournie "telle quelle" et "selon disponibilité", sans garantie d'aucune sorte, expresse ou implicite. Nous ne garantissons pas que la Plateforme sera ininterrompue, sécurisée ou exempte d'erreurs.
            </p>
            <p>
              <span className="font-medium">Limitation de responsabilité :</span> Dans toute la mesure permise par la loi, Klyra Design ne sera pas responsable des dommages indirects, spéciaux, accessoires, consécutifs ou punitifs, ni de toute perte de profits ou de revenus, résultant de votre utilisation de la Plateforme.
            </p>
            <p>
              <span className="font-medium">Indemnisation :</span> Vous acceptez de défendre, d'indemniser et de dégager de toute responsabilité Klyra Design, ses dirigeants, administrateurs, employés et agents contre toutes réclamations, dommages, obligations, pertes, responsabilités, coûts ou dettes résultant de votre utilisation de la Plateforme ou de votre violation de ces Conditions.
            </p>
          </section>

          <section id="changes" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Modifications des conditions
            </h2>
            <p>
              Nous nous réservons le droit de modifier ces Conditions à tout moment. Les modifications prendront effet dès leur publication sur la Plateforme. Nous vous informerons des modifications importantes par le biais d'une notification sur la Plateforme ou par e-mail.
            </p>
            <p>
              Votre utilisation continue de la Plateforme après la publication des Conditions modifiées constitue votre acceptation de ces modifications. Si vous n'acceptez pas les Conditions modifiées, vous devez cesser d'utiliser la Plateforme.
            </p>
          </section>

          <section id="legal" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Dispositions légales
            </h2>
            <p>
              <span className="font-medium">Loi applicable :</span> Les présentes Conditions sont régies et interprétées conformément aux lois françaises, sans égard aux principes de conflits de lois.
            </p>
            <p>
              <span className="font-medium">Règlement des litiges :</span> Tout litige découlant de ces Conditions ou en rapport avec celles-ci sera soumis à la compétence exclusive des tribunaux de Paris, France.
            </p>
            <p>
              <span className="font-medium">Intégralité de l'accord :</span> Ces Conditions constituent l'intégralité de l'accord entre vous et Klyra Design concernant votre utilisation de la Plateforme et remplacent tous les accords antérieurs ou contemporains, écrits ou oraux.
            </p>
            <p>
              <span className="font-medium">Dissociabilité :</span> Si une disposition de ces Conditions est jugée invalide ou inapplicable, cette disposition sera limitée ou éliminée dans la mesure minimale nécessaire, et les autres dispositions resteront pleinement en vigueur.
            </p>
            <p>
              <span className="font-medium">Non-renonciation :</span> Notre manquement à faire valoir un droit ou une disposition de ces Conditions ne constitue pas une renonciation à ce droit ou à cette disposition.
            </p>
          </section>

          <section id="contact" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Nous contacter
            </h2>
            <p>
              Si vous avez des questions concernant ces Conditions, veuillez nous contacter :
            </p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <p className="font-medium">Klyra Design</p>
              <p>Adresse : 123 Avenue du Design, 75001 Paris, France</p>
              <p>Email : legal@klyra.design</p>
              <p>Téléphone : +33 1 23 45 67 89</p>
            </div>
          </section>
          
          <div className="bg-gray-50 p-6 rounded-lg mt-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-medium">Historique des versions</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>10 avril 2025</span>
                <span>Version actuelle</span>
              </li>
              <li className="flex justify-between">
                <span>15 janvier 2025</span>
                <span>Mise à jour des clauses de paiement</span>
              </li>
              <li className="flex justify-between">
                <span>10 octobre 2024</span>
                <span>Version initiale</span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Documentation
              </Link>
              <Link
                href="/dashboard/docs/legal/confidentialite"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Politique de confidentialité →
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