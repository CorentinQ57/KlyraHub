"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { TableOfContents, TocItem } from "@/components/docs/TableOfContents";
import { LinkCard, LinkItem } from "@/components/docs/LinkCard";
import DocHeader from "@/components/docs/DocHeader";
import DocSection from "@/components/docs/DocSection";
import DocNote from "@/components/docs/DocNote";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Liens recommandés dans la barre latérale
const relatedLinks: LinkItem[] = [
  {
    title: "Rapporter un problème",
    href: "/dashboard/docs/support/probleme",
    icon: <AlertTriangle className="h-4 w-4 text-primary" />,
  },
  {
    title: "FAQ",
    href: "/dashboard/docs/faq",
    icon: <MessageSquare className="h-4 w-4 text-primary" />,
  },
];

// Conversion du format pour DocHeader qui attend href et label
const formattedRelatedLinks = relatedLinks.map(link => ({
  href: link.href,
  label: link.title
}));

export default function ContactSupportPage() {
  const [tocItems] = useState<TocItem[]>([
    { id: "introduction", title: "Notre support client", level: 2 },
    { id: "contact-info", title: "Informations de contact", level: 2 },
    { id: "form", title: "Formulaire de contact", level: 2 },
    { id: "hours", title: "Heures d'ouverture", level: 2 },
    { id: "response-time", title: "Délais de réponse", level: 2 },
  ]);

  // État du formulaire de contact
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    submitted: false,
    loading: false,
    error: false
  });

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ ...formState, loading: true });
    
    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setFormState({
        ...formState,
        submitted: true,
        loading: false
      });
    }, 1500);
  };

  return (
    <div>
      <DocHeader
        title="Contacter le support"
        description="Besoin d'aide ? Notre équipe de support est là pour vous répondre."
        tableOfContents={tocItems}
        relatedLinks={formattedRelatedLinks}
      />

      <DocSection id="introduction" title="Notre support client" icon={CheckCircle}>
        <p className="mb-4">
          Chez Klyra Design, nous accordons une importance capitale à votre satisfaction. Notre équipe de support client est disponible pour répondre à toutes vos questions, vous aider à résoudre les problèmes que vous pourriez rencontrer et recueillir vos commentaires pour améliorer constamment nos services.
        </p>
        <p>
          Nous proposons plusieurs moyens de nous contacter, chacun adapté à des besoins différents. Que vous préfériez une assistance par e-mail, par téléphone ou via notre formulaire en ligne, nous sommes là pour vous aider.
        </p>
      </DocSection>

      <DocSection id="contact-info" title="Informations de contact" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Email</h3>
                <p className="text-muted-foreground mb-2">Pour toutes vos questions</p>
                <p className="font-medium">support@klyra.design</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Téléphone</h3>
                <p className="text-muted-foreground mb-2">Support technique et commercial</p>
                <p className="font-medium">+33 1 23 45 67 89</p>
              </div>
            </div>
          </Card>
        </div>
      </DocSection>

      <DocSection id="form" title="Formulaire de contact" icon={MessageSquare}>
        {!formState.submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom complet
                </label>
                <Input
                  id="name"
                  placeholder="Votre nom"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Sujet
                </label>
                <Input
                  id="subject"
                  placeholder="L'objet de votre message"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie
                </label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState({ ...formState, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Support technique</SelectItem>
                    <SelectItem value="billing">Facturation</SelectItem>
                    <SelectItem value="project">Question sur un projet</SelectItem>
                    <SelectItem value="feature">Suggestion de fonctionnalité</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Décrivez votre question ou problème en détail"
                rows={6}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                required
              />
            </div>

            <DocNote>
              Nous nous engageons à répondre à votre demande dans un délai de 24 heures ouvrées. Pour des questions urgentes, nous vous recommandons de nous contacter par téléphone.
            </DocNote>

            <Button type="submit" disabled={formState.loading} className="w-full sm:w-auto">
              {formState.loading ? "Envoi en cours..." : "Envoyer le message"}
            </Button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-base font-medium text-green-800">Message envoyé avec succès</h3>
                <p className="text-sm text-green-700 mt-1">
                  Merci pour votre message. Notre équipe de support a bien reçu votre demande et vous répondra dans les plus brefs délais.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFormState({
                    name: "",
                    email: "",
                    subject: "",
                    category: "",
                    message: "",
                    submitted: false,
                    loading: false,
                    error: false
                  })}
                >
                  Envoyer un nouveau message
                </Button>
              </div>
            </div>
          </div>
        )}
      </DocSection>

      <DocSection id="hours" title="Heures d'ouverture" icon={Clock}>
        <p className="mb-4">
          Notre équipe de support est disponible pour vous aider pendant les heures suivantes :
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 border shadow-sm">
            <h3 className="font-medium">Support par email & formulaire</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-medium">8h00 - 20h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi</span>
                <span className="font-medium">9h00 - 17h00</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche & jours fériés</span>
                <span className="font-medium">Fermé</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 border shadow-sm">
            <h3 className="font-medium">Support téléphonique</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-medium">9h00 - 18h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi, dimanche & jours fériés</span>
                <span className="font-medium">Fermé</span>
              </li>
            </ul>
          </Card>
        </div>
        <DocNote type="info" title="À noter">
          En dehors des heures d'ouverture, vous pouvez toujours envoyer vos demandes par email ou via le formulaire. Nous les traiterons dès la reprise de notre activité.
        </DocNote>
      </DocSection>

      <DocSection id="response-time" title="Délais de réponse" icon={Clock}>
        <p className="mb-4">
          Nous nous efforçons de répondre à toutes les demandes dans les meilleurs délais. Voici nos délais de réponse habituels :
        </p>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span><strong>Questions générales :</strong> Dans les 24 heures ouvrées</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span><strong>Demandes techniques :</strong> Dans les 24-48 heures ouvrées</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span><strong>Problèmes urgents :</strong> Dans les 4-8 heures ouvrées (priorité élevée)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span><strong>Incidents critiques :</strong> Traitement immédiat pendant les heures d'ouverture</span>
          </li>
        </ul>
        <p className="mt-4">
          Pour les problèmes urgents nécessitant une résolution rapide, nous recommandons de nous contacter par téléphone pendant nos heures d'ouverture.
        </p>
      </DocSection>
    </div>
  );
} 