'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableOfContents, TocItem } from '@/components/docs/TableOfContents';
import { LinkCard, LinkItem } from '@/components/docs/LinkCard';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  Lock,
} from 'lucide-react';

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: 'Conditions d\'utilisation',
    href: '/dashboard/docs/legal/conditions',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Contacter le support',
    href: '/dashboard/docs/support/contact',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

export default function PrivacyPolicyPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'collect', title: 'Informations collectées', level: 2 },
    { id: 'use', title: 'Utilisation des informations', level: 2 },
    { id: 'share', title: 'Partage des informations', level: 2 },
    { id: 'cookies', title: 'Cookies et technologies similaires', level: 2 },
    { id: 'security', title: 'Sécurité des données', level: 2 },
    { id: 'rights', title: 'Vos droits', level: 2 },
    { id: 'retention', title: 'Conservation des données', level: 2 },
    { id: 'changes', title: 'Modifications de cette politique', level: 2 },
    { id: 'contact', title: 'Nous contacter', level: 2 },
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
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-muted-foreground">
              Dernière mise à jour : 10 avril 2025
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h2 className="text-base font-medium text-blue-800">Engagement de protection des données</h2>
                <p className="text-sm text-blue-700 mt-1">
                  Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles avec le plus grand soin. Cette politique explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
              </div>
            </div>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Introduction
            </h2>
            <p>
              Klyra Design ("nous", "notre", "nos") respecte votre vie privée et s'engage à protéger vos données personnelles. Cette politique de confidentialité vous informera sur la manière dont nous prenons soin de vos données personnelles lorsque vous visitez notre site web (quelle que soit votre localisation) et vous informera de vos droits en matière de protection des données et de la manière dont la loi vous protège.
            </p>
            <p>
              Il est important que vous lisiez cette politique de confidentialité ainsi que toute autre politique de confidentialité que nous pourrions fournir lors d'occasions particulières lorsque nous collectons ou traitons des données personnelles vous concernant, afin que vous soyez pleinement informé de la manière dont et des raisons pour lesquelles nous utilisons vos données.
            </p>
          </section>

          <section id="collect" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Informations collectées
            </h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations que vous nous fournissez</h3>
              <p>
                Nous collectons les informations que vous nous fournissez directement, telles que :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informations d'identification (nom, prénom, adresse e-mail, numéro de téléphone)</li>
                <li>Informations de compte (nom d'utilisateur, mot de passe)</li>
                <li>Informations de paiement (coordonnées bancaires, adresse de facturation)</li>
                <li>Contenu que vous partagez (fichiers téléchargés, commentaires, messages)</li>
                <li>Préférences et paramètres que vous définissez sur notre plateforme</li>
              </ul>

              <h3 className="text-lg font-medium">Informations collectées automatiquement</h3>
              <p>
                Lorsque vous utilisez notre plateforme, nous collectons automatiquement certaines informations, telles que :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informations sur votre appareil (type d'appareil, système d'exploitation, navigateur)</li>
                <li>Adresse IP et données de localisation approximative</li>
                <li>Données d'utilisation (pages visitées, temps passé sur la plateforme, actions effectuées)</li>
                <li>Cookies et technologies similaires (voir section dédiée)</li>
              </ul>

              <h3 className="text-lg font-medium">Informations provenant de tiers</h3>
              <p>
                Nous pouvons recevoir des informations vous concernant si vous utilisez d'autres services que nous fournissons ou d'autres sites web que nous exploitons. Nous travaillons également avec des tiers (y compris, par exemple, des partenaires commerciaux, des sous-traitants de services techniques, de paiement et de livraison, des réseaux publicitaires, des fournisseurs d'analyse, des fournisseurs d'informations de recherche) et pouvons recevoir des informations vous concernant de leur part.
              </p>
            </div>
          </section>

          <section id="use" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Utilisation des informations
            </h2>
            <p>
              Nous utilisons les informations que nous collectons pour :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir, exploiter et améliorer nos services</li>
              <li>Personnaliser votre expérience et vous proposer des contenus et services adaptés</li>
              <li>Traiter vos transactions et gérer votre compte</li>
              <li>Communiquer avec vous concernant votre compte, nos services, promotions et mises à jour</li>
              <li>Répondre à vos demandes et fournir un support client</li>
              <li>Analyser l'utilisation de notre plateforme pour améliorer nos services</li>
              <li>Détecter, prévenir et résoudre les problèmes techniques et de sécurité</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
            <p>
              Nous traitons vos données personnelles uniquement lorsque nous avons une base légale pour le faire, notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Lorsque c'est nécessaire pour l'exécution d'un contrat avec vous</li>
              <li>Lorsque vous avez donné votre consentement</li>
              <li>Lorsque c'est nécessaire pour nos intérêts légitimes (ou ceux d'un tiers) et que vos intérêts et droits fondamentaux ne prévalent pas sur ces intérêts</li>
              <li>Lorsque nous devons nous conformer à une obligation légale ou réglementaire</li>
            </ul>
          </section>

          <section id="share" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Partage des informations
            </h2>
            <p>
              Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <span className="font-medium">Prestataires de services :</span> Des tiers qui fournissent des services pour notre compte, tels que le traitement des paiements, l'analyse des données, l'envoi d'e-mails, l'hébergement, le service client, et le marketing. Ces prestataires ont accès à vos informations personnelles uniquement pour effectuer ces tâches en notre nom et sont contractuellement tenus de ne pas les divulguer ou les utiliser à d'autres fins.
              </li>
              <li>
                <span className="font-medium">Partenaires commerciaux :</span> Nous pouvons partager des informations avec nos partenaires commerciaux pour vous offrir certains produits, services ou promotions.
              </li>
              <li>
                <span className="font-medium">Autorités légales :</span> Nous pouvons divulguer vos informations si la loi l'exige ou en réponse à des procédures légales valides, telles que des mandats de perquisition, des assignations à comparaître ou des ordonnances judiciaires.
              </li>
              <li>
                <span className="font-medium">Avec votre consentement :</span> Nous pouvons partager vos informations avec d'autres parties avec votre consentement ou selon vos instructions.
              </li>
              <li>
                <span className="font-medium">Transferts d'entreprise :</span> En cas de fusion, acquisition, réorganisation, faillite ou autre vente de tout ou partie de nos actifs, vos informations peuvent faire partie des actifs transférés.
              </li>
            </ul>
            <p className="font-medium mt-4">
              Nous ne vendons pas vos données personnelles à des tiers.
            </p>
          </section>

          <section id="cookies" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Cookies et technologies similaires
            </h2>
            <p>
              Nous utilisons des cookies et des technologies similaires pour collecter des informations sur votre activité, votre navigateur et votre appareil. Les cookies sont de petits fichiers texte stockés sur votre navigateur ou appareil. Ils nous permettent de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mémoriser vos préférences et paramètres</li>
              <li>Vous permettre de vous connecter à votre compte</li>
              <li>Mesurer l'efficacité de nos services et améliorer leur performance</li>
              <li>Comprendre comment vous utilisez notre plateforme</li>
              <li>Personnaliser votre expérience et les publicités que vous pourriez voir</li>
            </ul>
            <p>
              Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur. Veuillez noter que la désactivation de certains cookies peut affecter les fonctionnalités de notre plateforme.
            </p>
            <p>
              Pour plus d'informations sur les cookies spécifiques que nous utilisons, leurs finalités et comment les gérer, veuillez consulter notre <span className="text-primary">Politique relative aux cookies</span>.
            </p>
          </section>

          <section id="security" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Sécurité des données
            </h2>
            <p>
              Nous avons mis en place des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte accidentelle, l'utilisation non autorisée, la modification ou la divulgation. Ces mesures comprennent :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Le chiffrement des données sensibles</li>
              <li>Des contrôles d'accès stricts pour les employés et les prestataires</li>
              <li>Des audits de sécurité réguliers</li>
              <li>Des sauvegardes régulières des données</li>
              <li>Des protocoles de détection et de réponse aux incidents</li>
            </ul>
            <p>
              Bien que nous nous efforcions de protéger vos informations personnelles, veuillez noter qu'aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée. Nous ne pouvons garantir la sécurité absolue de vos données.
            </p>
          </section>

          <section id="rights" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Vos droits
            </h2>
            <p>
              Selon votre emplacement géographique, vous pouvez bénéficier de certains droits concernant vos données personnelles. Ces droits peuvent inclure :
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <span className="font-medium">Droit d'accès :</span> Vous pouvez demander une copie des données personnelles que nous détenons à votre sujet.
              </li>
              <li>
                <span className="font-medium">Droit de rectification :</span> Vous pouvez demander la correction des données personnelles inexactes ou incomplètes.
              </li>
              <li>
                <span className="font-medium">Droit à l'effacement :</span> Vous pouvez demander la suppression de vos données personnelles dans certaines circonstances.
              </li>
              <li>
                <span className="font-medium">Droit à la limitation du traitement :</span> Vous pouvez demander la limitation du traitement de vos données personnelles dans certaines circonstances.
              </li>
              <li>
                <span className="font-medium">Droit à la portabilité des données :</span> Vous pouvez demander le transfert de vos données personnelles à vous-même ou à un tiers.
              </li>
              <li>
                <span className="font-medium">Droit d'opposition :</span> Vous pouvez vous opposer au traitement de vos données personnelles dans certaines circonstances.
              </li>
              <li>
                <span className="font-medium">Droit de retirer votre consentement :</span> Si nous traitons vos données sur la base de votre consentement, vous pouvez retirer ce consentement à tout moment.
              </li>
            </ul>
            <p>
              Pour exercer l'un de ces droits, veuillez nous contacter à l'adresse fournie à la fin de cette politique. Nous répondrons à votre demande dans les délais prévus par la loi applicable.
            </p>
          </section>

          <section id="retention" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Conservation des données
            </h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour atteindre les finalités décrites dans cette politique de confidentialité, à moins qu'une période de conservation plus longue ne soit requise ou permise par la loi.
            </p>
            <p>
              Les critères utilisés pour déterminer nos périodes de conservation comprennent :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La durée pendant laquelle nous avons une relation continue avec vous</li>
              <li>Les obligations légales auxquelles nous sommes soumis</li>
              <li>Les délais de prescription applicables en cas de litiges potentiels</li>
              <li>Nos intérêts commerciaux légitimes</li>
            </ul>
            <p>
              Lorsque nous n'avons plus besoin de traiter vos données personnelles pour les finalités énoncées dans cette politique, nous supprimerons ou anonymiserons ces informations.
            </p>
          </section>

          <section id="changes" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Modifications de cette politique
            </h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre en réponse à des changements juridiques, techniques ou commerciaux. Lorsque nous mettons à jour notre politique de confidentialité, nous prendrons les mesures appropriées pour vous informer, en fonction de l'importance des changements apportés.
            </p>
            <p>
              Nous vous encourageons à consulter régulièrement cette politique pour rester informé des dernières pratiques en matière de protection des données. La date de la dernière mise à jour sera toujours indiquée en haut de cette politique.
            </p>
            <p>
              Votre utilisation continue de notre plateforme après toute modification de cette politique de confidentialité constituera votre acceptation de ces modifications.
            </p>
          </section>

          <section id="contact" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Nous contacter
            </h2>
            <p>
              Si vous avez des questions, des préoccupations ou des demandes concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, veuillez nous contacter :
            </p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <p className="font-medium">Klyra Design</p>
              <p>Adresse : 123 Avenue du Design, 75001 Paris, France</p>
              <p>Email : privacy@klyra.design</p>
              <p>Téléphone : +33 1 23 45 67 89</p>
            </div>
            <p>
              Nous nous efforcerons de répondre à toutes les demandes dans les meilleurs délais et conformément aux lois applicables.
            </p>
            <p>
              Si vous n'êtes pas satisfait de notre réponse, vous avez le droit de déposer une plainte auprès de l'autorité de protection des données compétente.
            </p>
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
                <span>Mise à jour relative au RGPD</span>
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
                href="/dashboard/docs/legal/conditions"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Conditions d'utilisation
              </Link>
              <Link
                href="/dashboard/docs"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Documentation →
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