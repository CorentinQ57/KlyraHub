'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableOfContents, TocItem } from '@/components/docs/TableOfContents';
import { LinkCard, LinkItem } from '@/components/docs/LinkCard';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Repeat,
  ThumbsUp,
  Search,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  Zap,
} from 'lucide-react';

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: 'Cycle de vie d\'un projet',
    href: '/dashboard/docs/projets/cycle-vie',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Suivi et communication',
    href: '/dashboard/docs/projets/suivi',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
  {
    title: 'Questions fréquentes',
    href: '/dashboard/docs/faq',
    icon: <FileText className="h-4 w-4 text-primary" />,
  },
];

// Étapes du processus de validation
type ValidationStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const validationSteps: ValidationStep[] = [
  {
    id: 'notification',
    title: 'Notification de livraison',
    description: 'Vous recevez une notification par email et dans votre tableau de bord vous informant qu\'un livrable est prêt pour révision.',
    icon: <Bell className="h-6 w-6" />,
  },
  {
    id: 'review',
    title: 'Examen du livrable',
    description: 'Consultez le livrable dans l\'interface de révision et examinez attentivement tous les aspects du travail.',
    icon: <Search className="h-6 w-6" />,
  },
  {
    id: 'feedback',
    title: 'Soumission des retours',
    description: 'Fournissez vos commentaires, suggestions et demandes de modification directement dans l\'interface.',
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    id: 'revisions',
    title: 'Cycle de révisions',
    description: 'Notre équipe effectue les modifications demandées et vous soumet une version révisée pour approbation.',
    icon: <RefreshCw className="h-6 w-6" />,
  },
  {
    id: 'approval',
    title: 'Validation finale',
    description: 'Une fois satisfait du résultat, vous validez formellement le livrable qui passe en statut \'Approuvé\'.',
    icon: <ThumbsUp className="h-6 w-6" />,
  },
];

// Types de validation
type ValidationType = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prosCons: {
    pros: string[];
    cons: string[];
  };
};

const validationTypes: ValidationType[] = [
  {
    id: 'standard',
    title: 'Validation standard',
    description: 'Processus de validation habituel avec revue attentive et soumission de commentaires détaillés.',
    icon: <CheckCircle className="h-6 w-6" />,
    prosCons: {
      pros: [
        'Permet une revue complète et détaillée',
        'Garantit un résultat final parfaitement aligné avec vos attentes',
        'Inclut jusqu\'à 2 cycles de révisions',
      ],
      cons: [
        'Demande du temps pour une revue approfondie',
        'Peut prolonger légèrement le délai de livraison finale',
      ],
    },
  },
  {
    id: 'express',
    title: 'Validation express',
    description: 'Processus accéléré avec un délai de révision réduit pour les projets urgents.',
    icon: <Zap className="h-6 w-6" />,
    prosCons: {
      pros: [
        'Délai de validation de 24-48h maximum',
        'Maintient le projet dans un calendrier serré',
        'Idéal pour les projets avec deadline proche',
      ],
      cons: [
        'Limite le temps disponible pour une revue détaillée',
        'Réduit le nombre potentiel de révisions à 1 cycle',
      ],
    },
  },
  {
    id: 'auto',
    title: 'Validation automatique',
    description: 'Validation automatique après un délai prédéfini si aucun retour n\'est soumis.',
    icon: <Clock className="h-6 w-6" />,
    prosCons: {
      pros: [
        'Évite les blocages du projet en cas d\'indisponibilité du client',
        'Garantit la progression du projet même sans action du client',
        'Option activable/désactivable selon vos préférences',
      ],
      cons: [
        'Risque de valider un livrable qui nécessiterait des ajustements',
        'Recommandé uniquement pour les livrables mineurs ou intermédiaires',
      ],
    },
  },
];

// Importation de l'icône Bell manquante
import { Bell } from 'lucide-react';

export default function DeliverableValidationPage() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Générer la table des matières
  useEffect(() => {
    const items: TocItem[] = [
      { id: 'introduction', title: 'Introduction', level: 2 },
      { id: 'process', title: 'Processus de validation', level: 2 },
      ...validationSteps.map((step) => ({
        id: step.id,
        title: step.title,
        level: 3,
      })),
      { id: 'types', title: 'Types de validation', level: 2 },
      ...validationTypes.map((type) => ({
        id: type.id,
        title: type.title,
        level: 3,
      })),
      { id: 'best-practices', title: 'Bonnes pratiques', level: 2 },
      { id: 'revisions', title: 'Gestion des révisions', level: 2 },
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
            <h1 id="validation-livrables" className="text-3xl font-bold tracking-tight mb-2">
              Validation des livrables
            </h1>
            <p className="text-lg text-muted-foreground">
              Guide complet pour comprendre et optimiser le processus de validation de vos livrables.
            </p>
          </div>

          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              L'importance de la validation
            </h2>
            <p>
              La validation des livrables est une étape cruciale dans le cycle de vie d'un projet. Elle vous permet de vérifier que le travail réalisé correspond à vos attentes et de demander des ajustements si nécessaire, avant d'approuver définitivement chaque livrable.
            </p>
            <p>
              Chez Klyra Design, nous avons conçu un processus de validation structuré qui garantit :
            </p>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Qualité</strong> - Chaque livrable respecte nos standards de qualité et vos exigences.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Efficacité</strong> - Le processus est fluide et intuitif, minimisant le temps nécessaire pour réviser et valider.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                <span><strong>Traçabilité</strong> - Tous les commentaires et modifications sont documentés pour référence future.</span>
              </li>
            </ul>
          </section>

          <section id="process" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Processus de validation
            </h2>
            <p>
              Notre processus de validation se déroule en 5 étapes principales, conçues pour assurer une communication claire et des résultats optimaux.
            </p>

            <div className="space-y-8 mt-6">
              {validationSteps.map((step, index) => (
                <div key={step.id} id={step.id} className="relative">
                  {index < validationSteps.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
                  )}
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-6">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                      
                      {step.id === 'notification' && (
                        <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                          <p className="text-blue-700 text-sm">
                            <strong>Astuce :</strong> Activez les notifications dans vos paramètres pour recevoir une alerte sur votre téléphone dès qu'un nouveau livrable est disponible.
                          </p>
                        </div>
                      )}
                      
                      {step.id === 'review' && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Notre interface de révision vous permet de :
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Zoomer et naviguer dans les documents</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Comparer différentes versions</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Vérifier la conformité avec le brief initial</span>
                            </li>
                          </ul>
                        </div>
                      )}
                      
                      {step.id === 'feedback' && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Vous pouvez laisser des commentaires de différentes manières :
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Annotations directement sur le document</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Commentaires généraux sur l'ensemble du livrable</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Dessins et croquis pour illustrer vos idées</span>
                            </li>
                          </ul>
                        </div>
                      )}
                      
                      {step.id === 'revisions' && (
                        <div className="mt-4 p-4 border rounded-lg bg-amber-50">
                          <p className="text-amber-700 text-sm">
                            <strong>Important :</strong> Chaque service inclut un nombre spécifique de cycles de révisions. Consultez les détails de votre offre pour connaître le nombre de révisions incluses dans votre forfait.
                          </p>
                        </div>
                      )}
                      
                      {step.id === 'approval' && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            La validation finale peut se faire de trois façons :
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Cliquer sur le bouton "Approuver" dans l'interface</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Répondre "Approuvé" à l'email de notification</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">Validation automatique après le délai configuré (si activée)</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="types" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Types de validation
            </h2>
            <p>
              Selon la nature de votre projet et vos contraintes de temps, vous pouvez choisir entre différents types de validation. Chaque type offre un équilibre différent entre rigueur et rapidité.
            </p>

            <div className="grid grid-cols-1 gap-6 mt-6">
              {validationTypes.map((type) => (
                <div key={type.id} id={type.id} className="border rounded-lg overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-lg mr-4">
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{type.title}</h3>
                        <p className="text-muted-foreground">{type.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-700 mb-2">Avantages</h4>
                        <ul className="space-y-2">
                          {type.prosCons.pros.map((pro, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-green-700 text-sm">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-700 mb-2">Limitations</h4>
                        <ul className="space-y-2">
                          {type.prosCons.cons.map((con, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              <span className="text-red-700 text-sm">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 mt-4 border rounded-lg bg-primary/5">
              <h3 className="font-semibold">Comment choisir votre type de validation</h3>
              <p className="text-muted-foreground mt-2">
                Vous pouvez définir un type de validation par défaut dans vos paramètres de compte, mais aussi le modifier pour chaque projet ou même pour chaque livrable individuellement.
              </p>
              <div className="mt-4">
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm">
                    Configurer mes préférences de validation
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="best-practices" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Bonnes pratiques pour une validation efficace
            </h2>
            <p>
              Pour tirer le meilleur parti du processus de validation et garantir des résultats optimaux, voici quelques recommandations :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Planifiez du temps dédié</h3>
                <p className="text-sm text-muted-foreground">
                  Réservez un créneau spécifique dans votre agenda pour examiner les livrables. Une révision précipitée peut conduire à manquer des détails importants.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Impliquez les bonnes personnes</h3>
                <p className="text-sm text-muted-foreground">
                  Identifiez les décideurs clés et assurez-vous qu'ils participent au processus de validation pour éviter des révisions contradictoires.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Consolidez vos retours</h3>
                <p className="text-sm text-muted-foreground">
                  Rassemblez tous vos commentaires en une seule soumission cohérente plutôt que d'envoyer plusieurs séries de retours fragmentés.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Soyez spécifique et constructif</h3>
                <p className="text-sm text-muted-foreground">
                  Expliquez clairement ce qui fonctionne et ce qui ne fonctionne pas, et si possible, suggérez des alternatives pour les éléments à modifier.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Respectez les délais</h3>
                <p className="text-sm text-muted-foreground">
                  Soumettez vos retours dans les délais convenus pour éviter de retarder l'ensemble du projet et maintenir le momentum créatif.
                </p>
              </div>

              <div className="border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold">Vérifiez la concordance avec le brief</h3>
                <p className="text-sm text-muted-foreground">
                  Assurez-vous que vos commentaires et demandes de modifications restent alignés avec le brief initial et les objectifs du projet.
                </p>
              </div>
            </div>
          </section>

          <section id="revisions" className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Gestion des révisions
            </h2>
            <p>
              Comprendre comment fonctionnent les cycles de révisions vous aidera à optimiser vos retours et à obtenir le résultat souhaité dans le cadre de votre forfait.
            </p>

            <div className="space-y-6 mt-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Nombre de révisions incluses</h3>
                <p className="text-muted-foreground mb-4">
                  Chaque service Klyra inclut un nombre spécifique de cycles de révisions :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Forfait Essentiel</h4>
                    <p className="text-2xl font-bold text-primary">1 révision</p>
                    <p className="text-xs text-muted-foreground mt-1">Par livrable</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Forfait Professionnel</h4>
                    <p className="text-2xl font-bold text-primary">2 révisions</p>
                    <p className="text-xs text-muted-foreground mt-1">Par livrable</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Forfait Premium</h4>
                    <p className="text-2xl font-bold text-primary">3 révisions</p>
                    <p className="text-xs text-muted-foreground mt-1">Par livrable</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold">Qu'est-ce qui compte comme un cycle de révision ?</h3>
                <p className="text-muted-foreground">
                  Un cycle de révision commence lorsque vous soumettez vos commentaires et se termine lorsque nous vous présentons la version révisée. Tous les commentaires soumis en une seule fois comptent comme un seul cycle, quelle que soit leur quantité.
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold">Révisions supplémentaires</h3>
                <p className="text-muted-foreground">
                  Si vous avez besoin de plus de cycles de révision que ce qui est inclus dans votre forfait, vous pouvez acheter des révisions supplémentaires à l'unité ou par pack.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Révision à l'unité</h4>
                    <p className="text-lg font-bold">49€</p>
                    <p className="text-sm text-muted-foreground mt-1">Pour un cycle de révision supplémentaire sur un livrable spécifique</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Pack de révisions</h4>
                    <p className="text-lg font-bold">199€</p>
                    <p className="text-sm text-muted-foreground mt-1">Pour 5 cycles de révision à utiliser sur n'importe quel livrable du projet</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/purchases">
                    <Button variant="outline" size="sm">
                      Acheter des révisions supplémentaires
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-5 border rounded-lg bg-amber-50">
                <h3 className="font-semibold text-amber-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                  Changements majeurs hors-scope
                </h3>
                <p className="text-amber-700 mt-2">
                  Les demandes de modifications qui s'écartent significativement du brief initial ou qui impliquent des changements majeurs dans la direction créative peuvent être considérées comme hors-scope et nécessiter un devis supplémentaire.
                </p>
                <p className="text-amber-700 mt-2 text-sm">
                  Notre équipe vous informera si une demande est considérée comme hors-scope et discutera avec vous des options disponibles avant de procéder.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <Link
                href="/dashboard/docs/projets/suivi"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center"
              >
                ← Suivi et communication
              </Link>
              <Link
                href="/dashboard/docs/faq"
                className="text-sm text-primary hover:text-primary/80 flex items-center"
              >
                Questions fréquentes →
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