'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TableOfContents, TocItem } from '@/components/docs/TableOfContents';
import { LinkCard, LinkItem } from '@/components/docs/LinkCard';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MessageSquare,
  Search,
  HelpCircle,
} from 'lucide-react';

// Structure pour les questions fréquentes
type FAQ = {
  category: string;
  id: string;
  questions: {
    id: string;
    question: string;
    answer: React.ReactNode;
  }[];
};

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: 'Support client',
    href: '/dashboard/docs/support/contact',
    description: 'Notre équipe est disponible pour vous aider',
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Rapporter un problème',
    href: '/dashboard/docs/support/probleme',
    icon: <MessageSquare className="h-4 w-4 text-primary" />,
  },
];

// Définition des FAQs par catégorie
const faqs: FAQ[] = [
  {
    category: 'Général',
    id: 'general',
    questions: [
      {
        id: 'what-is-klyra',
        question: 'Qu\'est-ce que Klyra Design ?',
        answer: (
          <div>
            <p>
              Klyra Design est une agence spécialisée en design, branding et stratégie digitale à destination des TPE/PME tech ambitieuses. Notre plateforme vous permet de :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Découvrir et acheter nos services packagés</li>
              <li>Suivre l'avancement de vos projets</li>
              <li>Communiquer facilement avec notre équipe</li>
              <li>Accéder à vos livrables et ressources</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'account-creation',
        question: 'Comment créer un compte sur Klyra Design ?',
        answer: (
          <p>
            Créer un compte est simple et gratuit ! Cliquez sur "S'inscrire" en haut à droite de notre site, remplissez le formulaire avec votre adresse e-mail et un mot de passe sécurisé. Vous recevrez un e-mail de confirmation pour activer votre compte. Une fois confirmé, vous pourrez accéder à votre tableau de bord et explorer nos services.
          </p>
        ),
      },
      {
        id: 'service-types',
        question: 'Quels types de services proposez-vous ?',
        answer: (
          <div>
            <p>
              Nous proposons une gamme complète de services dans les domaines suivants :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Design d'interfaces (UI/UX)</li>
              <li>Identité de marque et branding</li>
              <li>Sites web et applications</li>
              <li>Stratégie digitale</li>
              <li>Conseil et accompagnement</li>
            </ul>
            <p className="mt-2">
              Consultez notre <Link href="/dashboard/docs/services/catalogue" className="text-primary hover:underline">catalogue de services</Link> pour découvrir toutes nos offres en détail.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    category: 'Projets et commandes',
    id: 'projects',
    questions: [
      {
        id: 'order-process',
        question: 'Comment passer une commande pour un service ?',
        answer: (
          <div>
            <p>Pour commander un service :</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Connectez-vous à votre compte</li>
              <li>Accédez à notre marketplace</li>
              <li>Sélectionnez le service qui vous intéresse</li>
              <li>Cliquez sur "Acheter maintenant"</li>
              <li>Complétez le processus de paiement</li>
              <li>Votre projet sera automatiquement créé</li>
            </ol>
            <p className="mt-2">
              Après votre achat, un projet est automatiquement créé et notre équipe est notifiée. Vous pouvez suivre l'avancement de votre projet depuis votre tableau de bord.
            </p>
          </div>
        ),
      },
      {
        id: 'project-timeline',
        question: 'Combien de temps prendra mon projet ?',
        answer: (
          <p>
            La durée de réalisation dépend du service choisi. Chaque service dans notre marketplace indique clairement le délai estimé (par exemple : 5, 10 ou 15 jours). Ces délais commencent à courir une fois que votre projet a été validé par notre équipe et que nous avons reçu toutes les informations nécessaires de votre part.
          </p>
        ),
      },
      {
        id: 'project-stages',
        question: 'Quelles sont les différentes étapes d\'un projet ?',
        answer: (
          <div>
            <p>Chaque projet passe par 5 étapes principales :</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
              <li><strong>En attente de validation</strong> - Nous examinons votre commande</li>
              <li><strong>Projet validé</strong> - Votre projet est intégré à notre planning</li>
              <li><strong>En cours de réalisation</strong> - Nos designers travaillent sur votre projet</li>
              <li><strong>Livrables disponibles</strong> - Les fichiers sont prêts à être téléchargés</li>
              <li><strong>Projet terminé</strong> - Le projet est complet et archivé</li>
            </ol>
            <p className="mt-2">
              Pour plus de détails, consultez notre page sur le <Link href="/dashboard/docs/projets/cycle-vie" className="text-primary hover:underline">cycle de vie d'un projet</Link>.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    category: 'Paiements et facturation',
    id: 'payments',
    questions: [
      {
        id: 'payment-methods',
        question: 'Quels modes de paiement acceptez-vous ?',
        answer: (
          <div>
            <p>Nous acceptons les méthodes de paiement suivantes :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Cartes de crédit (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Virement bancaire (pour les commandes importantes)</li>
            </ul>
            <p className="mt-2">
              Tous les paiements sont sécurisés et nous ne stockons aucune information de carte de crédit sur nos serveurs.
            </p>
          </div>
        ),
      },
      {
        id: 'refund-policy',
        question: 'Quelle est votre politique de remboursement ?',
        answer: (
          <p>
            Nous offrons un remboursement complet si votre demande est faite dans les 48 heures suivant l'achat et si le travail n'a pas encore commencé. Une fois que le projet est en cours de réalisation, des frais peuvent s'appliquer. Contactez notre service client pour discuter de votre situation spécifique.
          </p>
        ),
      },
      {
        id: 'invoice-download',
        question: 'Comment récupérer mes factures ?',
        answer: (
          <p>
            Vous pouvez télécharger vos factures à tout moment depuis votre tableau de bord. Accédez à "Mon compte" {'>'} "Historique des achats", puis cliquez sur l'icône de téléchargement à côté de la commande concernée. Les factures sont au format PDF et contiennent toutes les informations nécessaires pour votre comptabilité.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Support et assistance',
    id: 'support',
    questions: [
      {
        id: 'contact-support',
        question: 'Comment contacter le support client ?',
        answer: (
          <div>
            <p>Plusieurs options s'offrent à vous pour contacter notre support :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Via la page de votre projet (commentaires)</li>
              <li>Par email à support@klyra.design</li>
              <li>
                Via notre <Link href="/dashboard/docs" className="text-primary hover:underline">formulaire de contact</Link>
              </li>
            </ul>
            <p className="mt-2">
              Notre équipe de support est disponible du lundi au vendredi, de 9h à 18h (heure de Paris) et s'engage à vous répondre dans un délai de 24 heures ouvrées.
            </p>
          </div>
        ),
      },
      {
        id: 'feedback',
        question: 'Comment puis-je donner mon avis sur un service ?',
        answer: (
          <p>
            Votre feedback est précieux ! Une fois votre projet terminé, vous recevrez automatiquement une invitation par email pour évaluer le service. Vous pouvez également laisser un commentaire directement sur la page de votre projet ou contacter notre service client pour partager votre expérience.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Technique',
    id: 'technical',
    questions: [
      {
        id: 'file-formats',
        question: 'Quels formats de fichiers recevrai-je pour les livrables ?',
        answer: (
          <div>
            <p>
              En fonction du service commandé, vous recevrez différents formats :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li><strong>Design graphique</strong> : AI, PSD, PDF, PNG, JPG</li>
              <li><strong>Web design</strong> : Figma, XD, HTML/CSS</li>
              <li><strong>Logo & identité</strong> : AI, EPS, PDF, PNG (transparent)</li>
              <li><strong>Documents</strong> : PDF, DOCX</li>
            </ul>
            <p className="mt-2">
              Si vous avez besoin d'un format spécifique, n'hésitez pas à le mentionner lors de la commande ou à contacter notre équipe.
            </p>
          </div>
        ),
      },
      {
        id: 'browser-compatibility',
        question: 'Quels navigateurs sont supportés par votre plateforme ?',
        answer: (
          <div>
            <p>
              Notre plateforme est optimisée pour les navigateurs modernes :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Google Chrome (recommandé)</li>
              <li>Mozilla Firefox</li>
              <li>Microsoft Edge</li>
              <li>Safari</li>
              <li>Opera</li>
            </ul>
            <p className="mt-2">
              Nous recommandons d'utiliser la dernière version de ces navigateurs pour une expérience optimale.
            </p>
          </div>
        ),
      },
      {
        id: 'account-security',
        question: 'Comment est sécurisé mon compte ?',
        answer: (
          <p>
            La sécurité de vos données est notre priorité. Nous utilisons le chiffrement SSL pour toutes les communications, authentification à deux facteurs (2FA) en option, et des politiques strictes de protection des données. Vos informations de paiement ne sont jamais stockées sur nos serveurs et nous respectons toutes les exigences du RGPD.
          </p>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>(faqs);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = faqs.map((faq) => ({
      id: faq.id,
      title: faq.category,
      level: 2,
    }));
    setTocItems(items);
  }, []);

  // Filtrer les FAQs en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = faqs
      .map((faqCategory) => {
        const filteredQuestions = faqCategory.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(query) ||
            (typeof q.answer === 'string' && q.answer.toLowerCase().includes(query))
        );

        if (filteredQuestions.length === 0) {
          return null;
        }

        return {
          ...faqCategory,
          questions: filteredQuestions,
        };
      })
      .filter(Boolean) as FAQ[];

    setFilteredFaqs(filtered);
  }, [searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Contenu principal */}
      <div className="flex-1">
        <div className="space-y-8">
          <div>
            <Link
              href="/dashboard/docs"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4"
            >
              ← Retour à la documentation
            </Link>
            <h1 id="faq" className="text-3xl font-bold tracking-tight mb-2">
              Questions fréquemment posées
            </h1>
            <p className="text-lg text-muted-foreground">
              Trouvez rapidement des réponses aux questions les plus courantes sur Klyra Design.
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border rounded-md placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Aucune question trouvée</p>
              <p className="text-muted-foreground">
                Essayez de reformuler votre recherche ou{' '}
                <Link
                  href="/dashboard/docs/support/contact"
                  className="text-primary hover:underline"
                >
                  contactez-nous
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredFaqs.map((faqCategory) => (
                <section id={faqCategory.id} key={faqCategory.id} className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight border-b pb-2">
                    {faqCategory.category}
                  </h2>

                  <div className="space-y-4">
                    {faqCategory.questions.map((item) => (
                      <div
                        key={item.id}
                        id={item.id}
                        className="border rounded-lg p-4 transition-all hover:shadow-md"
                      >
                        <h3 className="text-lg font-semibold">
                          {item.question}
                        </h3>
                        <div className="mt-2 text-muted-foreground">
                          {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="border-t pt-6 mt-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Vous n'avez pas trouvé ce que vous cherchez ?
              </h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe de support est là pour vous aider avec toutes vos questions.
              </p>
              <Link href="/dashboard/docs/support/contact">
                <Button>Contacter le support</Button>
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
              title="Ressources liées"
              links={relatedLinks}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 