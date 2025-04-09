"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { 
  FileText, 
  CreditCard, 
  Download, 
  Calendar, 
  FileCheck,
  AlertTriangle,
  DollarSign,
  Receipt,
  Clock,
  Mail
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Gestion de compte",
    href: "/dashboard/docs/compte/gestion",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Modes de paiement",
    href: "/dashboard/docs/compte/paiement",
    icon: <CreditCard className="h-4 w-4 text-primary" />,
  },
  {
    title: "Contacter le support",
    href: "/dashboard/docs/support/contact",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
];

export default function BillingDocPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "overview", title: "Vue d'ensemble", level: 2 },
    { id: "invoice-generation", title: "Génération des factures", level: 2 },
    { id: "invoice-details", title: "Détails des factures", level: 2 },
    { id: "payment-methods", title: "Méthodes de paiement", level: 2 },
    { id: "payment-terms", title: "Conditions de paiement", level: 2 },
    { id: "download-invoice", title: "Téléchargement des factures", level: 2 },
    { id: "billing-issues", title: "Problèmes de facturation", level: 2 },
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
              Facturation
            </h1>
            <p className="text-lg text-muted-foreground">
              Tout ce que vous devez savoir sur notre processus de facturation, la gestion des paiements et l'accès à vos factures.
            </p>
          </div>

          <section id="overview" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Vue d'ensemble
            </h2>
            <p>
              Notre système de facturation est conçu pour être transparent, simple et flexible. Chaque achat effectué 
              sur Klyra génère automatiquement une facture que vous pouvez consulter à tout moment dans votre espace client.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Accès rapide :</strong> Toutes vos factures sont accessibles dans la section "Facturation" 
                de votre espace client, sous l'onglet "Historique d'achats".
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Receipt className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Factures instantanées</h3>
                <p className="text-sm text-muted-foreground">
                  Factures générées immédiatement après chaque achat
                </p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Download className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Téléchargement facile</h3>
                <p className="text-sm text-muted-foreground">
                  Format PDF téléchargeable et imprimable
                </p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Historique complet</h3>
                <p className="text-sm text-muted-foreground">
                  Accès à l'ensemble de votre historique de facturation
                </p>
              </div>
            </div>
          </section>

          <section id="invoice-generation" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Génération des factures
            </h2>
            <p>
              Voici comment fonctionne notre processus de génération de factures :
            </p>

            <ol className="space-y-4 mt-4">
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">1</span>
                <div>
                  <h3 className="font-medium">Achat sur la plateforme</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lorsque vous effectuez un achat sur notre marketplace, le processus de facturation est automatiquement déclenché.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">2</span>
                <div>
                  <h3 className="font-medium">Validation du paiement</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Une fois le paiement validé par notre prestataire de services de paiement, une facture est générée.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">3</span>
                <div>
                  <h3 className="font-medium">Création de la facture</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    La facture inclut toutes les informations légales requises et les détails de votre achat.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary font-medium rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0">4</span>
                <div>
                  <h3 className="font-medium">Notification</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vous recevez une notification par email avec votre facture en pièce jointe et un lien pour y accéder depuis votre espace client.
                  </p>
                </div>
              </li>
            </ol>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-green-700">
                <strong>Bon à savoir :</strong> Toutes nos factures sont conformes à la législation française et incluent toutes les informations nécessaires pour votre comptabilité.
              </p>
            </div>
          </section>

          <section id="invoice-details" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Détails des factures
            </h2>
            <p>
              Nos factures contiennent toutes les informations requises par la loi et nécessaires à votre comptabilité.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Informations incluses dans chaque facture</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Informations vendeur</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Raison sociale</li>
                      <li>Adresse complète</li>
                      <li>Numéro SIRET</li>
                      <li>Numéro TVA intracommunautaire</li>
                      <li>Informations de contact</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Informations acheteur</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Nom/Raison sociale</li>
                      <li>Adresse de facturation</li>
                      <li>Numéro client</li>
                      <li>Numéro TVA (si applicable)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Détails de la transaction</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Numéro de facture unique</li>
                    <li>Date d'émission</li>
                    <li>Date de la transaction</li>
                    <li>Description détaillée des services achetés</li>
                    <li>Prix unitaire HT</li>
                    <li>Quantité</li>
                    <li>Montant HT total</li>
                    <li>Taux de TVA applicable</li>
                    <li>Montant de la TVA</li>
                    <li>Montant TTC</li>
                    <li>Méthode de paiement utilisée</li>
                    <li>Conditions de paiement</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Si vous avez besoin d'informations spécifiques à ajouter à vos factures (comme un numéro de bon de commande, un service ou un département particulier), veuillez le préciser dans les paramètres de votre compte sous la section "Facturation".
            </p>
          </section>

          <section id="payment-methods" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Méthodes de paiement
            </h2>
            <p>
              Nous acceptons plusieurs méthodes de paiement pour vous offrir un maximum de flexibilité.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  Carte bancaire
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Visa, Mastercard, American Express. Paiement sécurisé via notre prestataire de paiement certifié.
                </p>
              </div>
              
              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  Virement bancaire
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Nos coordonnées bancaires vous sont fournies lors de la commande. La validation de la commande intervient après réception du paiement.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Pour plus de détails sur les méthodes de paiement, consultez notre page <Link href="/dashboard/docs/compte/paiement" className="text-primary hover:underline">Modes de paiement</Link>.
              </p>
            </div>
          </section>

          <section id="payment-terms" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Conditions de paiement
            </h2>
            <p>
              Nos conditions de paiement varient selon le type de service et le montant de la commande.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Conditions standard</h3>
              </div>
              <div className="divide-y">
                <div className="p-4 flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Paiement immédiat</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pour tous les services standards proposés sur notre marketplace, le paiement est dû immédiatement lors de la commande.
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Acompte et paiement échelonné</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pour les projets importants (supérieurs à 3 000€), nous proposons la possibilité de payer un acompte de 50% à la commande, puis le solde à la livraison.
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Retard de paiement</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Conformément à la législation en vigueur, tout retard de paiement entraînera l'application de pénalités de retard au taux annuel de 12%, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-700">
                <strong>Important :</strong> Pour les clients professionnels souhaitant des conditions de paiement spécifiques ou un échéancier adapté, veuillez contacter notre service commercial avant de passer commande.
              </p>
            </div>
          </section>

          <section id="download-invoice" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Téléchargement des factures
            </h2>
            <p>
              Vous pouvez facilement télécharger vos factures depuis votre espace client.
            </p>

            <div className="space-y-4 mt-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Comment télécharger vos factures</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside pl-2">
                  <li>Connectez-vous à votre compte Klyra</li>
                  <li>Accédez à la section "Facturation" depuis votre tableau de bord</li>
                  <li>Cliquez sur l'onglet "Historique d'achats"</li>
                  <li>Recherchez la facture souhaitée dans la liste (filtrable par date ou service)</li>
                  <li>Cliquez sur l'icône de téléchargement à côté de la facture</li>
                  <li>La facture est téléchargée au format PDF sur votre appareil</li>
                </ol>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Format des factures</h3>
                <p className="text-sm text-muted-foreground">
                  Toutes nos factures sont au format PDF, compatibles avec tous les logiciels de lecture PDF et peuvent être aisément imprimées. Ces documents sont également archivés numériquement conformément à la législation en vigueur.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700">
                <strong>Astuce :</strong> Vous pouvez également recevoir à nouveau vos factures par email en cliquant sur le bouton "Envoyer par email" à côté de chaque facture dans votre historique.
              </p>
            </div>
          </section>

          <section id="billing-issues" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Problèmes de facturation
            </h2>
            <p>
              Si vous rencontrez des problèmes avec votre facturation, voici comment obtenir de l'aide.
            </p>

            <div className="mt-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Problèmes courants et solutions</h3>
              </div>
              <div className="divide-y">
                <div className="p-4">
                  <h4 className="font-medium">Informations incorrectes sur la facture</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si certaines informations sont incorrectes (adresse, nom de société, etc.), vous pouvez mettre à jour ces informations dans la section "Paramètres de facturation" de votre compte et demander une facture corrigée via le formulaire de contact.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Facture manquante</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si vous ne trouvez pas une facture correspondant à un achat, vérifiez d'abord vos emails (y compris les dossiers spam). Si la facture est introuvable, contactez notre service client en précisant la date et le service concernés.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Double facturation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    En cas de suspicion de double facturation, contactez immédiatement notre service client avec les détails des transactions concernées. Nous analyserons la situation et procéderons à un remboursement si nécessaire.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Besoin d'une facture au format spécifique</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si vous avez besoin d'un format de facture particulier pour votre comptabilité, contactez notre service facturation qui étudiera votre demande.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Signaler un problème urgent
              </h3>
              <p className="text-sm text-red-700 mt-2">
                Pour tout problème urgent concernant la facturation (paiement non reconnu, montant incorrect, etc.), veuillez contacter notre service facturation directement à l'adresse <span className="font-medium">facturation@klyra.design</span> ou par téléphone au <span className="font-medium">01 23 45 67 89</span> (du lundi au vendredi, 9h-18h).
              </p>
              <div className="mt-4">
                <Link href="/dashboard/docs/support/contact">
                  <Button variant="outline" size="sm">
                    Contacter le support
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/compte/gestion"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Gestion de compte
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