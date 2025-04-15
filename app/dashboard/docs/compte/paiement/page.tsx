"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import { 
  FileText, 
  CreditCard, 
  BanknoteIcon,
  Wallet,
  CheckCircle,
  AlertTriangle, 
  Clock,
  Lock,
  Shield,
  Building,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  HelpCircle
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Gestion de compte",
    href: "/dashboard/docs/compte/gestion",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Facturation",
    href: "/dashboard/docs/compte/facturation",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: "Commissions et paiements",
    href: "/dashboard/docs/projets/commissions",
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Définition des modes de paiement
type PaymentMethod = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  limits: string;
  advantages: string[];
  disadvantages: string[];
  recommended?: boolean;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit-card",
    title: "Carte bancaire",
    description: "Payez directement avec votre carte de crédit ou de débit.",
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    processingTime: "Instantané",
    limits: "Selon votre plafond bancaire",
    advantages: [
      "Paiement immédiat",
      "Procédure simple et rapide",
      "Reçus automatiques par email",
      "Option de sauvegarde sécurisée pour futurs achats"
    ],
    disadvantages: [
      "Limité par le plafond de votre carte",
      "Certaines banques peuvent bloquer les transactions importantes"
    ],
    recommended: true
  },
  {
    id: "bank-transfer",
    title: "Virement bancaire",
    description: "Effectuez un virement depuis votre compte bancaire vers le nôtre.",
    icon: <Building className="h-6 w-6 text-primary" />,
    processingTime: "1-3 jours ouvrés",
    limits: "Aucune limite supérieure",
    advantages: [
      "Pas de frais supplémentaires",
      "Idéal pour les montants importants",
      "Aucun plafond de paiement",
      "Sécurité élevée"
    ],
    disadvantages: [
      "Délai de traitement plus long",
      "Nécessite des actions manuelles",
      "Le projet ne démarre qu'après réception du paiement"
    ]
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Utilisez votre compte PayPal pour un paiement sécurisé.",
    icon: <Wallet className="h-6 w-6 text-primary" />,
    processingTime: "Instantané",
    limits: "Selon votre compte PayPal",
    advantages: [
      "Paiement rapide sans saisie de carte",
      "Protection acheteur",
      "Familier pour de nombreux utilisateurs",
      "Reçus automatiques"
    ],
    disadvantages: [
      "Frais potentiels selon votre pays",
      "Nécessite un compte PayPal"
    ]
  },
  {
    id: "direct-debit",
    title: "Prélèvement SEPA",
    description: "Pour les paiements récurrents ou échelonnés (Europe uniquement).",
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
    processingTime: "Configuration initiale: 3-5 jours",
    limits: "Selon accord",
    advantages: [
      "Idéal pour les paiements échelonnés",
      "Automatisé une fois configuré",
      "Pas besoin d'action pour chaque échéance",
      "Notifications avant chaque prélèvement"
    ],
    disadvantages: [
      "Configuration initiale plus longue",
      "Limité aux pays de la zone SEPA",
      "Nécessite un mandat signé"
    ]
  }
];

// FAQ sur les paiements
type PaymentFAQ = {
  question: string;
  answer: string;
};

const paymentFAQs: PaymentFAQ[] = [
  {
    question: "Comment modifier mon mode de paiement par défaut ?",
    answer: "Vous pouvez modifier votre mode de paiement par défaut dans les paramètres de votre compte, section 'Modes de paiement'. Sélectionnez la carte ou méthode souhaitée et cliquez sur 'Définir par défaut'."
  },
  {
    question: "Mes informations de paiement sont-elles sécurisées ?",
    answer: "Oui, toutes vos informations de paiement sont cryptées et sécurisées. Nous ne stockons jamais vos données de carte complètes sur nos serveurs - nous utilisons un prestataire de paiement certifié PCI DSS qui garantit les plus hauts standards de sécurité."
  },
  {
    question: "Puis-je avoir une facture au nom de mon entreprise ?",
    answer: "Oui, vous pouvez configurer les informations de facturation de votre entreprise dans les paramètres de votre compte. Toutes les factures futures seront automatiquement émises avec ces coordonnées."
  },
  {
    question: "Que faire si mon paiement est refusé ?",
    answer: "Si votre paiement est refusé, vérifiez d'abord les informations saisies et votre solde disponible. Si le problème persiste, contactez votre banque pour vous assurer qu'il n'y a pas de restrictions sur votre compte. Vous pouvez également essayer un autre mode de paiement ou contacter notre support."
  },
  {
    question: "Est-il possible de demander un remboursement ?",
    answer: "Les conditions de remboursement dépendent du stade de votre projet. Pour une demande avant le démarrage du projet, un remboursement intégral est possible. Pour les projets en cours, veuillez consulter nos conditions générales ou contacter notre service client."
  }
];

export default function PaymentMethodsPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "methods", title: "Modes de paiement acceptés", level: 2 },
      ...paymentMethods.map((method) => ({
        id: method.id,
        title: method.title,
        level: 3,
      })),
      { id: "managing", title: "Gérer vos moyens de paiement", level: 2 },
    { id: "security", title: "Sécurité des paiements", level: 2 },
      { id: "faq", title: "Questions fréquentes", level: 2 },
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
            <h1 id="modes-paiement" className="text-3xl font-bold tracking-tight mb-2">
              Modes de paiement
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez les différentes options de paiement disponibles et comment gérer vos informations financières.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Paiements simples et sécurisés
            </h2>
            <p>
              Chez Klyra Design, nous avons mis en place un système de paiement flexible et sécurisé pour vous permettre de régler vos projets en toute confiance. Nous acceptons plusieurs modes de paiement pour s'adapter à vos préférences.
            </p>
            
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 mt-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Sécurité garantie</h3>
                <p className="text-sm text-muted-foreground">
                    Tous les paiements sont traités via des plateformes sécurisées et cryptées. Vos informations financières ne sont jamais stockées directement sur nos serveurs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="methods" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Modes de paiement acceptés
            </h2>
            <p>
              Nous proposons plusieurs options de paiement pour répondre à vos besoins et préférences. Chaque méthode présente ses propres avantages en termes de rapidité, de facilité d'utilisation et de limites.
            </p>

            <div className="grid grid-cols-1 gap-6 mt-6">
              {paymentMethods.map((method) => (
                <Card key={method.id} id={method.id} className={method.recommended ? "border-primary/30 bg-primary/5" : ""}>
                  <CardHeader className={method.recommended ? "pb-2 border-b border-primary/20" : "pb-2 border-b"}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={method.recommended ? "bg-primary/20 p-2 rounded-lg" : "bg-muted p-2 rounded-lg"}>
                          {method.icon}
                        </div>
                        <CardTitle className="text-xl">{method.title}</CardTitle>
                  </div>
                      {method.recommended && (
                        <Badge className="bg-primary text-white">Recommandé</Badge>
                      )}
                  </div>
                    <CardDescription className="mt-2">
                      {method.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Délai de traitement</h4>
                        <p className="font-medium">{method.processingTime}</p>
                  </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Limites</h4>
                        <p className="font-medium">{method.limits}</p>
                </div>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-3">Avantages</h4>
                        <ul className="space-y-2">
                          {method.advantages.map((advantage, idx) => (
                            <li key={idx} className="flex items-start">
                              <PlusCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{advantage}</span>
                            </li>
                          ))}
                        </ul>
                </div>
                      <div>
                        <h4 className="text-sm font-medium text-primary mb-3">Limitations</h4>
                        <ul className="space-y-2">
                          {method.disadvantages.map((disadvantage, idx) => (
                            <li key={idx} className="flex items-start">
                              <MinusCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{disadvantage}</span>
                            </li>
                          ))}
                      </ul>
                </div>
              </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="managing" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Gérer vos moyens de paiement
            </h2>
            <p>
              Vous pouvez facilement ajouter, modifier ou supprimer vos moyens de paiement depuis votre espace client.
            </p>

            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Accédez à vos paramètres</h3>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous à votre compte et rendez-vous dans "Paramètres" puis "Modes de paiement".
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Ajoutez un nouveau moyen de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur "Ajouter" et suivez les instructions pour enregistrer une nouvelle carte ou configurer un autre mode de paiement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Définissez votre moyen de paiement par défaut</h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez le mode de paiement que vous souhaitez utiliser par défaut et cliquez sur "Définir par défaut".
                  </p>
              </div>
            </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Supprimez un moyen de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    Pour supprimer un mode de paiement, cliquez sur les trois points à côté de celui-ci et sélectionnez "Supprimer".
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/dashboard/settings/payment">
                <Button>
                  Gérer mes moyens de paiement
                  <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          <section id="security" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Sécurité des paiements
            </h2>
            <p>
              La sécurité de vos informations financières est notre priorité absolue. Voici comment nous protégeons vos données de paiement :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Lock className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Cryptage SSL</h3>
                    <p className="text-sm text-muted-foreground">
                      Toutes les transactions sont protégées par un cryptage SSL 256 bits de bout en bout.
                </p>
              </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Conformité PCI DSS</h3>
                    <p className="text-sm text-muted-foreground">
                      Notre plateforme respecte les normes de sécurité les plus strictes de l'industrie bancaire.
                </p>
              </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Détection de fraude</h3>
                    <p className="text-sm text-muted-foreground">
                      Système automatisé de détection des activités suspectes pour protéger votre compte.
                </p>
              </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-2">Restez vigilant</h3>
                  <p className="text-sm text-amber-700">
                    Klyra Design ne vous demandera jamais vos informations de paiement par email ou téléphone. Toutes les transactions doivent être effectuées uniquement via notre plateforme sécurisée.
              </p>
            </div>
              </div>
            </div>
          </section>

          <section id="faq" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Questions fréquentes
            </h2>
            <p>
              Retrouvez les réponses aux questions les plus courantes concernant les paiements.
            </p>

            <div className="space-y-4 mt-6">
              {paymentFAQs.map((faq, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base flex items-start">
                      <HelpCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
                </div>

            <div className="border-t border-dashed pt-6 mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">D'autres questions ?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notre équipe support est disponible pour répondre à toutes vos questions sur les paiements.
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
                href="/dashboard/docs/compte/gestion"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Gestion de compte
              </Link>
              <Link
                href="/dashboard/docs/compte/facturation"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Facturation →
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