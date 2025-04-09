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
  ShieldCheck, 
  AlertTriangle, 
  Clock,
  HelpCircle,
  Mail,
  RefreshCw,
  DollarSign,
  Building
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Facturation",
    href: "/dashboard/docs/compte/facturation",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Gestion de compte",
    href: "/dashboard/docs/compte/gestion",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Contacter le support",
    href: "/dashboard/docs/support/contact",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
];

export default function PaymentMethodsPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "available-methods", title: "Méthodes disponibles", level: 2 },
    { id: "credit-card", title: "Paiement par carte bancaire", level: 2 },
    { id: "bank-transfer", title: "Virement bancaire", level: 2 },
    { id: "security", title: "Sécurité des paiements", level: 2 },
    { id: "adding-methods", title: "Ajouter une méthode de paiement", level: 2 },
    { id: "payment-issues", title: "Problèmes de paiement", level: 2 },
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
              Modes de paiement
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez les différentes méthodes de paiement acceptées par Klyra et comment les utiliser.
            </p>
          </div>

          <section id="available-methods" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Méthodes de paiement disponibles
            </h2>
            <p>
              Klyra vous propose plusieurs méthodes de paiement sécurisées pour régler vos achats. Chaque méthode a été soigneusement sélectionnée pour offrir sécurité, flexibilité et facilité d'utilisation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-medium flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  Carte bancaire
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paiement immédiat via notre système sécurisé. Nous acceptons les cartes Visa, Mastercard et American Express.
                </p>
                <div className="pt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Recommandé</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">Instantané</span>
                </div>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-medium flex items-center">
                  <Building className="h-5 w-5 text-primary mr-2" />
                  Virement bancaire
                </h3>
                <p className="text-sm text-muted-foreground">
                  Idéal pour les montants importants. Les virements peuvent prendre 1-3 jours ouvrés pour être traités.
                </p>
                <div className="pt-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Délai de traitement</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700">
                <strong>Note :</strong> Tous les prix affichés sur notre plateforme sont en euros (€). Pour les clients hors zone euro, le montant sera converti dans votre devise locale par votre banque au taux en vigueur le jour du paiement.
              </p>
            </div>
          </section>

          <section id="credit-card" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Paiement par carte bancaire
            </h2>
            <p>
              Le paiement par carte bancaire est la méthode la plus rapide et la plus simple pour régler vos achats sur Klyra.
            </p>

            <div className="space-y-6 mt-6">
              <div className="border rounded-lg p-5">
                <h3 className="font-medium mb-3">Cartes acceptées</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="p-3 border rounded-md text-center w-28">
                    <p className="text-sm font-medium">Visa</p>
                  </div>
                  <div className="p-3 border rounded-md text-center w-28">
                    <p className="text-sm font-medium">Mastercard</p>
                  </div>
                  <div className="p-3 border rounded-md text-center w-28">
                    <p className="text-sm font-medium">American Express</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-medium">Comment payer par carte</h3>
                </div>
                <div className="p-4">
                  <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside pl-2">
                    <li>Sélectionnez votre service et cliquez sur "Acheter maintenant"</li>
                    <li>Vérifiez votre panier et cliquez sur "Procéder au paiement"</li>
                    <li>Sélectionnez "Carte bancaire" comme méthode de paiement</li>
                    <li>Entrez les informations de votre carte :
                      <ul className="list-disc list-inside pl-4 mt-1">
                        <li>Numéro de carte (16 chiffres sans espaces)</li>
                        <li>Date d'expiration</li>
                        <li>Code de sécurité (CVV)</li>
                        <li>Nom du titulaire</li>
                      </ul>
                    </li>
                    <li>Validez le paiement (vous pourriez être redirigé vers la page d'authentification 3D Secure de votre banque)</li>
                    <li>Une fois le paiement confirmé, vous serez automatiquement redirigé vers la page de confirmation de commande</li>
                  </ol>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium flex items-center text-green-800">
                  <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
                  Sécurité 3D Secure
                </h3>
                <p className="text-sm text-green-700 mt-2">
                  Tous nos paiements par carte sont protégés par l'authentification 3D Secure (Verified by Visa, Mastercard SecureCode, etc.). Ce système de sécurité supplémentaire nécessite une validation directe avec votre banque, généralement via un code envoyé par SMS.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium flex items-center text-yellow-800">
                  <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  À propos de la sauvegarde des cartes
                </h3>
                <p className="text-sm text-yellow-700 mt-2">
                  Pour faciliter vos futurs achats, vous pouvez choisir d'enregistrer votre carte dans votre compte. Dans ce cas, vos données de carte sont sécurisées par notre prestataire de paiement et ne sont jamais stockées sur nos serveurs. Vous pouvez à tout moment supprimer vos cartes enregistrées depuis votre espace client.
                </p>
              </div>
            </div>
          </section>

          <section id="bank-transfer" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Virement bancaire
            </h2>
            <p>
              Le paiement par virement bancaire est idéal pour les achats de montants importants. Cette méthode nécessite un délai de traitement plus long que le paiement par carte.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Procédure de paiement par virement</h3>
              </div>
              <div className="p-4">
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside pl-2">
                  <li>Sélectionnez votre service et cliquez sur "Acheter maintenant"</li>
                  <li>Vérifiez votre panier et cliquez sur "Procéder au paiement"</li>
                  <li>Sélectionnez "Virement bancaire" comme méthode de paiement</li>
                  <li>Vous recevrez immédiatement :
                    <ul className="list-disc list-inside pl-4 mt-1">
                      <li>Un email contenant nos coordonnées bancaires complètes</li>
                      <li>Une référence de commande à indiquer impérativement lors de votre virement</li>
                    </ul>
                  </li>
                  <li>Effectuez le virement depuis votre compte bancaire en indiquant la référence</li>
                  <li>Dès réception de votre paiement, nous vous enverrons une confirmation et activerons votre service</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium flex items-center text-blue-800">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Délais de traitement
              </h3>
              <p className="text-sm text-blue-700 mt-2">
                Le traitement d'un paiement par virement peut prendre entre 1 et 3 jours ouvrés, selon votre banque et le jour de la semaine. Nous vous recommandons de prévoir ce délai dans la planification de votre projet.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium flex items-center text-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                Informations importantes
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-yellow-700">
                <li className="flex items-start">
                  <span className="h-5 w-5 text-yellow-600 mr-2">•</span>
                  <span>Assurez-vous d'indiquer la référence exacte de votre commande dans le libellé du virement.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-yellow-600 mr-2">•</span>
                  <span>Tous les frais bancaires éventuels sont à la charge du client.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-yellow-600 mr-2">•</span>
                  <span>Une fois votre virement effectué, vous pouvez nous envoyer une preuve de paiement pour accélérer le traitement.</span>
                </li>
              </ul>
            </div>
          </section>

          <section id="security" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Sécurité des paiements
            </h2>
            <p>
              La sécurité de vos paiements est notre priorité absolue. Nous utilisons les standards les plus élevés en matière de protection des données et de cryptage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  Cryptage SSL
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Toutes les transactions sur notre plateforme sont protégées par un cryptage SSL 256 bits, ce qui signifie que vos données sont chiffrées et sécurisées durant la transmission.
                </p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  Conformité PCI-DSS
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Notre prestataire de paiement est conforme à la norme PCI-DSS (Payment Card Industry Data Security Standard), garantissant le plus haut niveau de sécurité pour le traitement des cartes bancaires.
                </p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  Authentification forte (SCA)
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Conformément aux réglementations européennes, nous appliquons l'authentification forte pour tous les paiements (3D Secure), ajoutant une couche supplémentaire de sécurité.
                </p>
              </div>

              <div className="border rounded-lg p-5">
                <h3 className="font-medium flex items-center">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  Protection des données
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Nous ne stockons jamais vos données de carte complètes sur nos serveurs. Les informations sensibles sont traitées uniquement par notre prestataire de paiement certifié.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-green-700">
                <strong>Sécurité renforcée :</strong> Notre système de détection des fraudes analyse en temps réel chaque transaction pour identifier les comportements suspects et protéger votre compte contre toute utilisation non autorisée.
              </p>
            </div>
          </section>

          <section id="adding-methods" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Ajouter ou modifier une méthode de paiement
            </h2>
            <p>
              Vous pouvez facilement gérer vos méthodes de paiement depuis votre espace client.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Gérer vos cartes bancaires</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Pour ajouter une nouvelle carte bancaire :
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside pl-2">
                  <li>Connectez-vous à votre compte Klyra</li>
                  <li>Accédez à "Mon compte" depuis le menu déroulant sous votre avatar</li>
                  <li>Sélectionnez l'onglet "Méthodes de paiement"</li>
                  <li>Cliquez sur "Ajouter une carte"</li>
                  <li>Saisissez les informations de votre carte</li>
                  <li>Validez l'ajout (une vérification 3D Secure pourrait être requise)</li>
                </ol>

                <p className="text-sm text-muted-foreground mt-4 mb-4">
                  Pour supprimer une carte existante :
                </p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside pl-2">
                  <li>Accédez à la section "Méthodes de paiement"</li>
                  <li>Trouvez la carte que vous souhaitez supprimer</li>
                  <li>Cliquez sur l'icône de corbeille à côté de cette carte</li>
                  <li>Confirmez la suppression</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium flex items-center text-blue-800">
                <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
                Carte par défaut
              </h3>
              <p className="text-sm text-blue-700 mt-2">
                Si vous avez plusieurs cartes enregistrées, vous pouvez définir l'une d'entre elles comme votre méthode de paiement par défaut. Cette carte sera automatiquement sélectionnée lors de vos futurs achats, mais vous pourrez toujours choisir une autre méthode lors du paiement.
              </p>
            </div>
          </section>

          <section id="payment-issues" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Problèmes de paiement
            </h2>
            <p>
              Si vous rencontrez des difficultés lors du paiement, voici quelques solutions aux problèmes courants.
            </p>

            <div className="border rounded-lg overflow-hidden mt-6">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Problèmes fréquents et solutions</h3>
              </div>
              <div className="divide-y">
                <div className="p-4">
                  <h4 className="font-medium">Paiement refusé</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si votre paiement est refusé, vérifiez d'abord que vous avez correctement saisi toutes les informations de votre carte. Assurez-vous également que vous disposez de fonds suffisants et que votre carte n'est pas bloquée pour les paiements en ligne. En cas de doute, contactez votre banque.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Échec de l'authentification 3D Secure</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si l'authentification 3D Secure échoue, vérifiez que vous disposez bien de l'application mobile de votre banque ou que votre numéro de téléphone est à jour auprès de votre banque pour recevoir les codes de validation. Vous pouvez réessayer le paiement après quelques minutes.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Virement non reçu</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si votre virement a été effectué mais n'apparaît pas encore dans notre système, notez que les délais bancaires peuvent varier. Si après 3 jours ouvrés votre paiement n'est toujours pas enregistré, contactez notre service client avec une preuve de virement.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium">Page de paiement inaccessible</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si vous ne parvenez pas à accéder à la page de paiement, essayez d'actualiser votre navigateur ou d'utiliser un navigateur différent. Assurez-vous également que votre connexion internet est stable.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-6">
              <h3 className="font-medium text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Besoin d'aide urgente ?
              </h3>
              <p className="text-sm text-red-700 mt-2">
                Si vous avez été débité mais que votre commande n'apparaît pas comme payée, ou pour tout autre problème urgent lié au paiement, contactez immédiatement notre service client à <span className="font-medium">support@klyra.design</span> ou par téléphone au <span className="font-medium">01 23 45 67 89</span> (du lundi au vendredi, 9h-18h).
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
                href="/dashboard/docs/compte/facturation"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Facturation
              </Link>
              <Link
                href="/dashboard/docs/support/contact"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Contacter le support →
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