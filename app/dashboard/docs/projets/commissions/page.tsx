"use client";

import { Metadata } from "next";
import { Banknote, Calculator, Calendar, Clock, CreditCard, FileText, HelpCircle, PercentCircle, PiggyBank, Receipt, Shield, Users } from "lucide-react";
import DocHeader from "@/components/docs/DocHeader";
import DocSection from "@/components/docs/DocSection";
import DocList from "@/components/docs/DocList";
import DocNote from "@/components/docs/DocNote";
import { generateToc } from "@/lib/utils";

const relatedLinks = [
  { href: "/dashboard/docs/compte/paiement", label: "Méthodes de paiement" },
  { href: "/dashboard/docs/projets/validation", label: "Validation des projets" },
  { href: "/dashboard/docs/support/contact", label: "Contacter le support" },
];

export default function CommissionsAndPaymentsPage() {
  const headings = [
    { id: "structure", title: "Structure des commissions", icon: PercentCircle },
    { id: "calcul", title: "Calcul des commissions", icon: Calculator },
    { id: "paiement-designer", title: "Paiement des designers", icon: Banknote },
    { id: "calendrier", title: "Calendrier des paiements", icon: Calendar },
    { id: "facturation", title: "Facturation et reçus", icon: Receipt },
    { id: "taxes", title: "Taxes et obligations fiscales", icon: FileText },
    { id: "paiement-client", title: "Modes de paiement clients", icon: CreditCard },
    { id: "echeancier", title: "Échelonnement des paiements", icon: Clock },
    { id: "securite", title: "Sécurité des transactions", icon: Shield },
    { id: "faq", title: "Questions fréquentes", icon: HelpCircle },
  ];

  const tableOfContents = generateToc(headings);

  return (
    <div className="max-w-5xl mx-auto">
      <DocHeader
        title="Commissions et paiements"
        description="Découvrez comment fonctionne le système de commissions, de paiements et de facturation pour les projets sur Klyra."
        tableOfContents={tableOfContents}
        relatedLinks={relatedLinks}
      />

      <DocSection id="structure" title="Structure des commissions" icon={PercentCircle}>
        <p className="mb-4">
          Klyra utilise un modèle de commission transparent qui garantit une rémunération équitable pour tous les participants :
        </p>
        <DocList
          items={[
            "Commission plateforme : Pourcentage prélevé sur chaque transaction pour soutenir l'infrastructure et les services Klyra",
            "Part designer : Pourcentage majoritaire reversé directement au designer ou à l'agence réalisant le projet",
            "Frais de traitement : Petite part couvrant les frais de transaction bancaire et de gestion administrative",
            "Commissions partenaires : Dans certains cas, une commission peut être versée aux partenaires ayant recommandé le client"
          ]}
        />
        <p className="mt-4">
          La structure exacte des commissions varie selon :
        </p>
        <DocList
          items={[
            "Le type de service (standard ou personnalisé)",
            "Le volume d'affaires généré par le designer sur la plateforme",
            "L'ancienneté du designer sur Klyra",
            "Les éventuels accords spécifiques pour les grands comptes"
          ]}
        />
        <DocNote>
          Tous les pourcentages de commission sont clairement indiqués dans votre espace personnel et sur les devis générés.
        </DocNote>
      </DocSection>

      <DocSection id="calcul" title="Calcul des commissions" icon={Calculator}>
        <p className="mb-4">
          Les commissions sont calculées automatiquement par notre système selon une formule précise :
        </p>
        <DocList
          items={[
            "Base de calcul : Montant total HT du service",
            "Application du taux : Pourcentage défini selon le type de service et le statut du designer",
            "Déduction des frais : Frais de transaction bancaire et administratifs",
            "Calcul de la TVA : Si applicable, en fonction du statut fiscal du designer et du client",
            "Arrondis : Toujours effectués à deux décimales en faveur du designer"
          ]}
        />
        <p className="mb-4">
          Exemple de répartition standard :
        </p>
        <DocList
          items={[
            "Pour une prestation de 1 000€ HT",
            "Commission plateforme : 15% soit 150€",
            "Frais de traitement : 2,5% soit 25€",
            "Part designer : 82,5% soit 825€"
          ]}
        />
        <p className="mt-4">
          Les designers expérimentés et réguliers sur la plateforme peuvent bénéficier de taux préférentiels pouvant aller jusqu'à 90% de reversement.
        </p>
      </DocSection>

      <DocSection id="paiement-designer" title="Paiement des designers" icon={Banknote}>
        <p className="mb-4">
          Le processus de paiement des designers est conçu pour être simple et sécurisé :
        </p>
        <DocList
          items={[
            "Déclenchement : Automatique après validation finale du livrable par le client",
            "Période de sécurité : Délai de 48h après validation pour couvrir d'éventuelles contestations",
            "Méthodes de paiement : Virement bancaire SEPA ou international",
            "Seuil minimal : Paiement déclenché à partir de 50€ (montants inférieurs cumulés jusqu'au seuil)",
            "Regroupement : Paiements hebdomadaires regroupant toutes les transactions validées"
          ]}
        />
        <p className="mb-4">
          Configuration de vos informations de paiement :
        </p>
        <DocList
          items={[
            "Accédez à votre espace designer {'>'}  Paramètres {'>'}  Informations de paiement",
            "Renseignez vos coordonnées bancaires (IBAN et BIC)",
            "Ajoutez vos informations fiscales (numéro de TVA si applicable)",
            "Téléchargez les documents requis (KYC, justificatifs d'identité)"
          ]}
        />
        <DocNote>
          Pour des raisons de sécurité, la première transaction vers un nouveau compte bancaire est limitée à 500€, même si le montant dû est supérieur. Le solde sera transféré lors du paiement suivant.
        </DocNote>
      </DocSection>

      <DocSection id="calendrier" title="Calendrier des paiements" icon={Calendar}>
        <p className="mb-4">
          Les paiements suivent un calendrier précis pour assurer prévisibilité et régularité :
        </p>
        <DocList
          items={[
            "Jour de paiement : Tous les vendredis pour les transactions validées avant mercredi minuit",
            "Délai de traitement bancaire : 1 à 3 jours ouvrés selon votre banque",
            "Période de gel : 48h après validation client pour vérification",
            "Notification : Email automatique détaillant les montants versés et les projets concernés",
            "Historique : Disponible en permanence dans votre espace personnel"
          ]}
        />
        <p className="mb-4">
          Calendrier spécial pour les grands volumes :
        </p>
        <DocList
          items={[
            "Designers Premium : Option de paiement bi-hebdomadaire",
            "Partenaires stratégiques : Possibilité de paiements personnalisés",
            "Projets de grande envergure : Échéancier négocié au cas par cas"
          ]}
        />
        <p className="mt-4">
          En cas de jour férié, les paiements sont automatiquement reportés au jour ouvré suivant.
        </p>
      </DocSection>

      <DocSection id="facturation" title="Facturation et reçus" icon={Receipt}>
        <p className="mb-4">
          La gestion de la facturation diffère selon votre statut :
        </p>
        <DocList
          items={[
            "Auto-entrepreneurs et freelances : Création manuelle de facture à partir des données fournies",
            "Entreprises : Possibilité de générer des factures automatiques ou d'intégrer via API",
            "Particuliers : Reçus automatiques générés par la plateforme",
            "Facturation inversée : Disponible pour certains partenaires qualifiés"
          ]}
        />
        <p className="mb-4">
          Informations incluses sur les documents :
        </p>
        <DocList
          items={[
            "Détails du service fourni et référence projet",
            "Montant HT, TVA (si applicable) et montant TTC",
            "Commission prélevée et montant net versé",
            "Coordonnées complètes des parties",
            "Conditions de paiement et informations légales"
          ]}
        />
        <p className="mt-4">
          Tous les documents sont archivés dans votre espace personnel et peuvent être exportés pour votre comptabilité.
        </p>
        <DocNote>
          Pour les designers internationaux, la plateforme gère automatiquement les aspects de TVA intracommunautaire conformément aux réglementations européennes.
        </DocNote>
      </DocSection>

      <DocSection id="taxes" title="Taxes et obligations fiscales" icon={FileText}>
        <p className="mb-4">
          Klyra facilite la gestion fiscale mais chaque partie reste responsable de ses obligations légales :
        </p>
        <DocList
          items={[
            "TVA : Appliquée selon le statut fiscal et la localisation des parties",
            "Retenue à la source : Traitée conformément aux conventions fiscales internationales",
            "Déclarations : Chaque utilisateur est responsable de ses propres déclarations fiscales",
            "Documentation : Mise à disposition des relevés annuels pour les déclarations"
          ]}
        />
        <p className="mb-4">
          Spécificités selon les régions :
        </p>
        <DocList
          items={[
            "Europe : Gestion automatique de la TVA intracommunautaire",
            "International : Application des règles de territorialité des services",
            "France : Conformité avec les obligations de facturation électronique",
            "Autres pays : Adaptation aux exigences locales lorsque possible"
          ]}
        />
        <p className="mt-4">
          Klyra ne fournit pas de conseil fiscal mais met à disposition des ressources informatives pour vous aider à comprendre vos obligations.
        </p>
        <DocNote>
          Nous vous recommandons de consulter un expert-comptable ou un conseiller fiscal pour vous assurer que vous respectez toutes vos obligations légales dans votre juridiction.
        </DocNote>
      </DocSection>

      <DocSection id="paiement-client" title="Modes de paiement clients" icon={CreditCard}>
        <p className="mb-4">
          Les clients disposent de plusieurs options pour régler leurs projets sur Klyra :
        </p>
        <DocList
          items={[
            "Carte bancaire : Paiement immédiat sécurisé (Visa, Mastercard, American Express)",
            "Virement bancaire : Option privilégiée pour les montants importants",
            "Prélèvement SEPA : Pour les abonnements et paiements échelonnés",
            "Portefeuille électronique : Klyra Credits pour les clients réguliers"
          ]}
        />
        <p className="mb-4">
          Avantages pour les designers :
        </p>
        <DocList
          items={[
            "Garantie de paiement : Fonds sécurisés avant le démarrage du projet",
            "Réduction des risques d'impayés : Vérification préalable des moyens de paiement",
            "Séquestre : Protection des fonds jusqu'à validation complète",
            "Traçabilité : Historique complet des transactions"
          ]}
        />
        <p className="mt-4">
          La plateforme prend en charge l'ensemble de la gestion des paiements, vous permettant de vous concentrer uniquement sur votre travail créatif.
        </p>
      </DocSection>

      <DocSection id="echeancier" title="Échelonnement des paiements" icon={Clock}>
        <p className="mb-4">
          Pour les projets importants, un échelonnement des paiements peut être mis en place :
        </p>
        <DocList
          items={[
            "Acompte initial : Généralement 30-50% à la commande",
            "Paiement intermédiaire : Lié à des jalons spécifiques du projet",
            "Paiement final : À la livraison et validation finale",
            "Retenue de garantie : Dans certains cas, une petite part peut être conservée pendant une période définie"
          ]}
        />
        <p className="mb-4">
          Fonctionnement des paiements échelonnés :
        </p>
        <DocList
          items={[
            "Configuration : Définie au moment de l'établissement du devis",
            "Automatisation : Prélèvements automatiques aux dates convenues",
            "Flexibilité : Possibilité d'ajuster l'échéancier en cas d'évolution du projet",
            "Transparence : Notification à chaque étape du processus"
          ]}
        />
        <p className="mt-4">
          Les designers sont payés progressivement à mesure que les jalons sont validés, sans attendre la finalisation complète du projet pour les grands travaux.
        </p>
        <DocNote>
          L'échelonnement des paiements n'est disponible que pour les projets dépassant un certain montant (généralement 1000€) et après validation par notre service client.
        </DocNote>
      </DocSection>

      <DocSection id="securite" title="Sécurité des transactions" icon={Shield}>
        <p className="mb-4">
          Klyra met en œuvre des mesures de sécurité avancées pour protéger toutes les transactions :
        </p>
        <DocList
          items={[
            "Chiffrement : Toutes les données financières sont chiffrées selon les normes bancaires",
            "Séquestre : Système de mise en séquestre des fonds jusqu'à validation",
            "Partenaires certifiés : Utilisation exclusive de prestataires de paiement conformes PCI DSS",
            "Vérification d'identité : Procédures KYC (Know Your Customer) pour tous les utilisateurs",
            "Surveillance : Détection des activités suspectes en temps réel"
          ]}
        />
        <p className="mb-4">
          Protocoles de protection spécifiques :
        </p>
        <DocList
          items={[
            "Validation en deux étapes pour les montants importants",
            "Limitation des transactions pour les nouveaux comptes",
            "Authentification forte pour toutes les opérations sensibles",
            "Historique détaillé et notifications immédiates",
            "Système de résolution des litiges intégré"
          ]}
        />
        <p className="mt-4">
          Ces mesures protègent à la fois les clients et les designers tout en maintenant la fluidité des transactions.
        </p>
        <DocNote>
          En cas de transaction suspecte, notre équipe de sécurité peut temporairement suspendre le processus jusqu'à vérification complète.
        </DocNote>
      </DocSection>

      <DocSection id="faq" title="Questions fréquentes" icon={HelpCircle}>
        <p className="font-medium mb-2">Quand suis-je payé pour mon travail ?</p>
        <p className="mb-4">
          Les paiements sont déclenchés 48h après la validation finale du client et sont traités chaque vendredi pour toutes les validations effectuées jusqu'au mercredi précédent.
        </p>
        
        <p className="font-medium mb-2">Comment puis-je connaître le montant exact que je vais recevoir ?</p>
        <p className="mb-4">
          Le montant net est clairement indiqué dans votre espace designer, dans la section "Projets" {'>'}  [Nom du projet] {'>'}  "Détails financiers".
        </p>
        
        <p className="font-medium mb-2">Que se passe-t-il si un client conteste un paiement ?</p>
        <p className="mb-4">
          En cas de contestation, notre équipe de médiation intervient. Les fonds restent en séquestre jusqu'à résolution du litige. Si votre travail est conforme au brief validé, votre paiement est garanti.
        </p>
        
        <p className="font-medium mb-2">Puis-je recevoir des paiements sur PayPal ou d'autres plateformes ?</p>
        <p className="mb-4">
          Actuellement, nous effectuons uniquement des virements bancaires. D'autres méthodes pourront être ajoutées à l'avenir selon les besoins des designers.
        </p>
        
        <p className="font-medium mb-2">Les commissions peuvent-elles être négociées ?</p>
        <p className="mb-4">
          Les designers réguliers et performants peuvent bénéficier automatiquement de taux préférentiels. Pour les grands volumes, des accords spécifiques peuvent être discutés avec notre équipe commerciale.
        </p>
        
        <p className="font-medium mb-2">Comment sont gérés les impôts sur mes revenus ?</p>
        <p className="mb-4">
          Klyra vous fournit tous les documents nécessaires pour vos déclarations, mais il reste de votre responsabilité de déclarer vos revenus conformément à la législation de votre pays.
        </p>
        
        <p className="font-medium mb-2">Que se passe-t-il en cas de retard de paiement ?</p>
        <p className="mb-4">
          Les paiements sont automatisés et rarement retardés. En cas de problème, notre service support intervient sous 24h pour résoudre la situation et vous tenir informé.
        </p>
      </DocSection>
    </div>
  );
} 