"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Smile, 
  Building2, 
  Target, 
  Palette, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Sparkles
} from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  teamSize: number;
  sector: string;
  experience: string;
  webPresence: string[];
  priorities: string[];
  skills: Record<string, number>;
  visualStyle: string;
  communicationStyle: string;
  deadlineStyle: string;
  profilePicture: string;
  socialLinks: Record<string, string>;
  funFact: string;
  badges: string[];
  level: number;
  xp: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const steps: OnboardingStep[] = [
  {
    id: "introduction",
    title: "Faisons connaissance",
    description: "Hey ! Super content de t'accueillir chez Klyra !",
    icon: <Smile className="h-6 w-6" />,
  },
  {
    id: "professional",
    title: "Ton univers pro",
    description: "Raconte-nous ton parcours professionnel",
    icon: <Building2 className="h-6 w-6" />,
    badge: "Aventurier du Business",
  },
  {
    id: "ambitions",
    title: "Tes ambitions",
    description: "Quels sont tes objectifs ?",
    icon: <Target className="h-6 w-6" />,
    badge: "Visionnaire Cool",
  },
  {
    id: "style",
    title: "Ton style",
    description: "Comment tu préfères qu'on échange ?",
    icon: <Palette className="h-6 w-6" />,
    badge: "Style Guru",
  },
  {
    id: "final",
    title: "Derniers détails",
    description: "Presque fini !",
    icon: <CheckCircle2 className="h-6 w-6" />,
    badge: "Membre de la famille Klyra",
  },
];

interface OnboardingWizardProps {
  onComplete: (profileData: UserProfile) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (steps[currentStep + 1].badge) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } else {
      // Onboarding complete
      const finalProfile: UserProfile = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        company: formData.company || "",
        teamSize: formData.teamSize || 0,
        sector: formData.sector || "",
        experience: formData.experience || "",
        webPresence: formData.webPresence || [],
        priorities: formData.priorities || [],
        skills: formData.skills || {},
        visualStyle: formData.visualStyle || "",
        communicationStyle: formData.communicationStyle || "",
        deadlineStyle: formData.deadlineStyle || "",
        profilePicture: formData.profilePicture || "",
        socialLinks: formData.socialLinks || {},
        funFact: formData.funFact || "",
        badges: steps
          .filter(step => step.badge)
          .map(step => step.badge || ""),
        level: 1,
        xp: 0
      };
      onComplete(finalProfile);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Étape {currentStep + 1} sur {steps.length}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2">
              {steps[currentStep].icon}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Step-specific content */}
          <div className="space-y-4">
            {currentStep === 0 && <IntroductionStep formData={formData} setFormData={setFormData} />}
            {currentStep === 1 && <ProfessionalStep formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <AmbitionsStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <StyleStep formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <FinalStep formData={formData} setFormData={setFormData} />}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? (
                "Terminer"
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Badge celebration */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-primary/90 text-white p-6 rounded-lg shadow-lg border border-primary-foreground">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
              <p className="text-white/90">
                Tu as débloqué le badge "{steps[currentStep].badge}" !
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Step components
function IntroductionStep({ formData, setFormData }: { 
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input 
            id="firstName" 
            placeholder="Ton prénom"
            value={formData.firstName || ""}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input 
            id="lastName" 
            placeholder="Ton nom"
            value={formData.lastName || ""}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Entreprise</Label>
          <Input 
            id="company" 
            placeholder="Le nom de ton entreprise"
            value={formData.company || ""}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="teamSize">Taille de l'équipe</Label>
          <Input
            id="teamSize"
            type="number"
            placeholder="Combien êtes-vous dans l'équipe ?"
            value={formData.teamSize || ""}
            onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}

function ProfessionalStep({ formData, setFormData }: { 
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Secteur d'activité</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Tech", "E-commerce", "Services", "Industrie"].map((sector) => (
              <Button
                key={sector}
                variant={formData.sector === sector ? "default" : "outline"}
                className="h-auto py-3"
                onClick={() => setFormData({ ...formData, sector })}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Ancienneté</Label>
          <div className="flex gap-2">
            {["< 1 an", "1-3 ans", "3-5 ans", "5+ ans"].map((years) => (
              <Button
                key={years}
                variant={formData.experience === years ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFormData({ ...formData, experience: years })}
              >
                {years}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Présence web actuelle</Label>
          <div className="space-y-2">
            {["Site web", "Réseaux sociaux", "E-commerce", "Aucun"].map((presence) => (
              <div key={presence} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={presence}
                  checked={formData.webPresence?.includes(presence)}
                  onChange={(e) => {
                    const newPresence = e.target.checked
                      ? [...(formData.webPresence || []), presence]
                      : (formData.webPresence || []).filter(p => p !== presence);
                    setFormData({ ...formData, webPresence: newPresence });
                  }}
                />
                <label htmlFor={presence}>{presence}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AmbitionsStep({ formData, setFormData }: { 
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Priorités business</Label>
          <div className="space-y-2">
            {["Visibilité", "Conversion", "Fidélisation", "Innovation"].map((priority) => (
              <Card 
                key={priority} 
                className={cn(
                  "p-3 cursor-move",
                  formData.priorities?.includes(priority) && "border-primary"
                )}
                onClick={() => {
                  const newPriorities = formData.priorities?.includes(priority)
                    ? (formData.priorities || []).filter(p => p !== priority)
                    : [...(formData.priorities || []), priority];
                  setFormData({ ...formData, priorities: newPriorities });
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{priority}</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Auto-évaluation compétences</Label>
          <div className="space-y-2">
            {["Marketing", "Design", "Tech", "Business"].map((skill) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{skill}</span>
                  <span>{formData.skills?.[skill] || 0}%</span>
                </div>
                <Progress 
                  value={formData.skills?.[skill] || 0} 
                  className="h-2"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.round((x / rect.width) * 100);
                    setFormData({
                      ...formData,
                      skills: {
                        ...formData.skills,
                        [skill]: percentage
                      }
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleStep({ formData, setFormData }: { 
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Préférences visuelles</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Moderne", "Classique", "Minimaliste", "Coloré"].map((style) => (
              <Card 
                key={style} 
                className={cn(
                  "p-4 cursor-pointer hover:border-primary",
                  formData.visualStyle === style && "border-primary"
                )}
                onClick={() => setFormData({ ...formData, visualStyle: style })}
              >
                <div className="text-center">
                  <span>{style}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Style de communication</Label>
          <div className="space-y-2">
            {["Direct", "Diplomatique", "Technique", "Créatif"].map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="communication" 
                  id={style}
                  checked={formData.communicationStyle === style}
                  onChange={() => setFormData({ ...formData, communicationStyle: style })}
                />
                <label htmlFor={style}>{style}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Avec les deadlines, t'es plutôt...</Label>
          <div className="space-y-2">
            {["Zen", "Organisé", "À fond", "Flexible"].map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="deadlines" 
                  id={style}
                  checked={formData.deadlineStyle === style}
                  onChange={() => setFormData({ ...formData, deadlineStyle: style })}
                />
                <label htmlFor={style}>{style}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalStep({ formData, setFormData }: { 
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Photo de profil</Label>
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
            onClick={() => {
              // Handle file upload
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setFormData({ ...formData, profilePicture: e.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="w-24 h-24 rounded-full mx-auto"
              />
            ) : (
              <span className="text-muted-foreground">
                Clique pour ajouter une photo
              </span>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Réseaux sociaux</Label>
          <div className="space-y-2">
            {["LinkedIn", "Twitter", "Instagram", "Facebook"].map((social) => (
              <Input 
                key={social} 
                placeholder={`Ton ${social}`}
                value={formData.socialLinks?.[social] || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: {
                    ...formData.socialLinks,
                    [social]: e.target.value
                  }
                })}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Une question fun pour finir</Label>
          <Input 
            placeholder="Si tu étais un super-héros, ce serait..."
            value={formData.funFact || ""}
            onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
} 