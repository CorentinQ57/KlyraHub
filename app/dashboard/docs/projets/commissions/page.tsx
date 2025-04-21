'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableOfContents, TocItem } from '@/components/docs/TableOfContents';
import { LinkCard, LinkItem } from '@/components/docs/LinkCard';
import {
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Shield,
  HelpCircle,
  Receipt,
  PieChart,
} from 'lucide-react';

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: 'Facturation',
    href: '/dashboard/docs/compte/facturation',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Modes de paiement',
    href: '/dashboard/docs/compte/paiement',
    icon: <CreditCard className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Questions fréquentes',
    href: '/dashboard/docs/faq',
    icon: <HelpCircle className="h-4 w-4 text-primary" />,
  },
];

// Types de paiements
type PaymentOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  recommended?: boolean;
};

const paymentOptions: PaymentOption[] = [
  {
    id: 'full-payment',
    title: 'Paiement intégral',
    description: 'Réglez la totalité du montant en une seule fois au moment de la commande.',
    icon: <DollarSign className="h-6 w-6 text-primary" />,
    details: [
      'Réduction de 5% sur le montant total',
      'Déblocage immédiat de toutes les fonctionnalités',
      'Démarrage du projet sans délai',
      'Facturation unique simplifiée',
    ],
    recommended: true,
  },
  {
    id: 'milestone-payment',
    title: 'Paiement par étapes',
    description: 'Divisez le paiement en plusieurs versements liés à des jalons du projet.',
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    details: [
      '50% à la commande pour démarrer le projet',
      '25% après validation des premières maquettes',
      '25% à la livraison finale',
      'Facturation détaillée pour chaque jalon',
    ],
  },
  {
    id: 'monthly-payment',
    title: 'Paiement mensuel',
    description: 'Pour les projets importants, étalez le paiement sur plusieurs mois.',
    icon: <Calendar className="h-6 w-6 text-primary" />,
    details: [
      '30% à la commande pour démarrer le projet',
      'Mensualités égales sur la durée du projet',
      'Minimum 3 mois, maximum 12 mois',
      'Planning de versements fixé dès le départ',
    ],
  },
];

// Informations sur les commissions pour les projets spéciaux
type CommissionInfo = {
  id: string;
  title: string;
  description: string;
  rate: string;
  details: string[];
};

const commissionInfo: CommissionInfo[] = [
  {
    id: 'referral',
    title: 'Programme de parrainage',
    description: 'Recevez une commission pour chaque nouveau client que vous nous recommandez.',
    rate: '10% du premier projet',
    details: [
      'Applicable sur le montant hors taxes du premier projet',
      'Versement après la finalisation du projet et le paiement complet',
      'Sans limite du nombre de parrainages',
      'Cumulable avec vos propres achats',
    ],
  },
  {
    id: 'agency',
    title: 'Partenariat agence',
    description: 'Pour les agences qui sous-traitent régulièrement des projets de design.',
    rate: '15-20% selon volume',
    details: [
      'Grille tarifaire spéciale pour les agences partenaires',
      'Possibilité de marque blanche sur les livrables',
      'Dashboard dédié pour suivre tous vos projets',
      'Gestionnaire de compte attitré',
    ],
  },
  {
    id: 'volume',
    title: 'Remises sur volume',
    description: 'Des réductions automatiques basées sur le volume de vos commandes.',
    rate: '5-15% de remise',
    details: [
      '5% à partir de 3 000€ de commandes cumulées',
      '10% à partir de 10 000€ de commandes cumulées',
      '15% à partir de 25 000€ de commandes cumulées',
      'Remises appliquées automatiquement',
    ],
  },
];

export default function ProjectCommissionsPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: 'introduction', title: 'Introduction', level: 2 },
      { id: 'payment-options', title: 'Options de paiement', level: 2 },
      ...paymentOptions.map((option) => ({
        id: option.id,
        title: option.title,
        level: 3,
      })),
      { id: 'commissions', title: 'Programme de commissions', level: 2 },
      ...commissionInfo.map((info) => ({
        id: info.id,
        title: info.title,
        level: 3,
      })),
      { id: 'invoicing', title: 'Facturation et comptabilité', level: 2 },
      { id: 'security', title: 'Sécurité des paiements', level: 2 },
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
            <div className="flex items-center gap-3 mb-2">
              <h1 id="commissions-paiements" className="text-3xl font-bold tracking-tight">
                Commissions et paiements
              </h1>
              <Badge className="bg-green-100 text-green-800">Nouveau</Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              Tout ce que vous devez savoir sur les modes de paiement, la facturation et notre programme de commissions.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Flexibilité et transparence
            </h2>
            <p>
              Chez Klyra Design, nous proposons plusieurs options de paiement pour s'adapter à vos contraintes budgétaires et à la nature de votre projet. Notre politique tarifaire est basée sur la transparence totale, sans frais cachés.
            </p>
            <p>
              Ce document détaille les différentes modalités de paiement disponibles, ainsi que notre programme de commissions pour les partenaires et les parrainages.
            </p>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 mt-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Engagement Klyra</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous nous engageons à vous offrir un excellent rapport qualité-prix et une parfaite visibilité sur l'utilisation de votre budget. Toutes nos offres incluent une garantie de satisfaction pour vous assurer un résultat à la hauteur de vos attentes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="payment-options" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Options de paiement
            </h2>
            <p>
              Nous proposons plusieurs formules de paiement pour répondre aux différentes contraintes et préférences de nos clients.
            </p>

            <div className="grid grid-cols-1 gap-6 mt-6">
              {paymentOptions.map((option) => (
                <Card key={option.id} id={option.id} className={option.recommended ? 'border-primary/30 bg-primary/5' : ''}>
                  <CardHeader className={option.recommended ? 'pb-2 border-b border-primary/20' : 'pb-2 border-b'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={option.recommended ? 'bg-primary/20 p-2 rounded-lg' : 'bg-muted p-2 rounded-lg'}>
                          {option.icon}
                        </div>
                        <CardTitle className="text-xl">{option.title}</CardTitle>
                      </div>
                      {option.recommended && (
                        <Badge className="bg-primary text-white">Recommandé</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium mb-3">Ce que vous devez savoir:</h4>
                    <ul className="space-y-2">
                      {option.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-2">Important</h3>
                  <p className="text-sm text-amber-700">
                    Pour tous les projets nécessitant une collaboration sur une durée supérieure à 4 semaines, nous recommandons le paiement par étapes ou mensuel. Cette approche permet de mieux aligner le flux de paiement avec l'avancement du projet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="commissions" className="space-y-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Programme de commissions
              </h2>
              <Badge className="bg-green-100 text-green-800">Nouveau</Badge>
            </div>
            <p>
              Notre programme de commissions récompense les partenaires, les clients fidèles et ceux qui nous recommandent à leur réseau professionnel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {commissionInfo.map((info) => (
                <Card key={info.id} id={info.id} className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex flex-col gap-1">
                      <span>{info.title}</span>
                      <span className="text-2xl font-bold text-primary">{info.rate}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {info.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-muted p-6 rounded-lg mt-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Comment rejoindre notre programme de commissions
              </h3>
              <ol className="space-y-4 mt-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Contactez notre équipe</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Envoyez-nous un email à partenariats@klyra.design ou contactez-nous via le formulaire dédié.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Signez notre contrat de partenariat</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nous vous enverrons un contrat simple détaillant les conditions du programme et les taux de commission.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Recevez votre code partenaire</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Un code unique vous sera attribué, à utiliser dans vos recommandations pour suivre les conversions.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Suivez vos commissions en temps réel</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Accédez à un tableau de bord dédié pour suivre vos recommandations et les commissions générées.
                    </p>
                  </div>
                </li>
              </ol>
              <div className="mt-6">
                <Link href="/dashboard/docs/support/contact">
                  <Button variant="outline">
                    Contacter l'équipe partenariats
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="invoicing" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Facturation et comptabilité
            </h2>
            <p>
              Notre système de facturation est conçu pour être clair, détaillé et compatible avec vos obligations comptables.
            </p>

            <div className="space-y-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Receipt className="h-5 w-5 text-primary mr-2" />
                    Facturation automatique
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2">
                    Vous recevez automatiquement une facture pour chaque paiement effectué. Toutes les factures sont également disponibles dans votre espace client.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="font-normal text-xs">PDF</Badge>
                    <Badge variant="outline" className="font-normal text-xs">Excel</Badge>
                    <Badge variant="outline" className="font-normal text-xs">Export comptable</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    Délais de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    Nos factures sont payables à réception, sauf mention contraire dans votre contrat. Pour les paiements par étapes, chaque facture est émise 7 jours avant la date d'échéance prévue.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <RefreshCw className="h-5 w-5 text-primary mr-2" />
                    Modalités de remboursement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    En cas d'annulation d'un projet avant son démarrage, nous offrons un remboursement intégral. Pour les projets en cours, les conditions détaillées sont spécifiées dans nos conditions générales de vente.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Link href="/dashboard/docs/compte/facturation">
                <Button variant="outline">
                  En savoir plus sur la facturation
                </Button>
              </Link>
            </div>
          </section>

          <section id="security" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Sécurité des paiements
            </h2>
            <p>
              La sécurité de vos informations financières est notre priorité absolue. Nous utilisons les technologies les plus avancées pour protéger vos données de paiement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Paiements cryptés</h3>
                    <p className="text-sm text-muted-foreground">
                      Toutes les transactions sont protégées par un cryptage SSL 256 bits.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CreditCard className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Prestataire certifié</h3>
                    <p className="text-sm text-muted-foreground">
                      Notre plateforme de paiement est certifiée PCI DSS niveau 1.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium mb-2">Protection anti-fraude</h3>
                    <p className="text-sm text-muted-foreground">
                      Système de détection des transactions suspectes en temps réel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Image 
                src="/images/payment-security.png" 
                alt="Logos des certifications de sécurité"
                width={400}
                height={80}
                className="opacity-80"
              />
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/projets/validation"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Validation des livrables
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