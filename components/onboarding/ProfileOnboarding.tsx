import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { updateProfile } from '@/lib/supabase';

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  microSteps: {
    id: string;
    question: string;
    type: 'text' | 'select' | 'checkbox' | 'multi-select';
    options?: string[];
    placeholder?: string;
    validation?: (value: any) => boolean;
    errorMessage?: string;
  }[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'personal',
    title: 'Informations personnelles',
    description: 'Aidez-nous à mieux vous connaître',
    microSteps: [
      {
        id: 'name',
        question: 'Comment souhaitez-vous être appelé ?',
        type: 'text',
        placeholder: 'Votre nom préféré',
        validation: (value) => value.length >= 2,
        errorMessage: 'Le nom doit contenir au moins 2 caractères'
      },
      {
        id: 'role',
        question: 'Quel est votre rôle principal ?',
        type: 'select',
        options: ['Entrepreneur', 'Freelance', 'Dirigeant', 'Autre'],
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Vos préférences',
    description: 'Personnalisez votre expérience',
    microSteps: [
      {
        id: 'interests',
        question: 'Quels services vous intéressent ?',
        type: 'multi-select',
        options: ['Comptabilité', 'Juridique', 'Marketing', 'RH', 'Tech'],
      },
      {
        id: 'notifications',
        question: 'Comment souhaitez-vous être notifié ?',
        type: 'checkbox',
        options: ['Email', 'SMS', 'Application'],
      }
    ]
  },
  {
    id: 'goals',
    title: 'Vos objectifs',
    description: 'Définissons ensemble vos objectifs',
    microSteps: [
      {
        id: 'mainGoal',
        question: 'Quel est votre objectif principal ?',
        type: 'select',
        options: ['Croissance', 'Optimisation', 'Innovation', 'Stabilité'],
      },
      {
        id: 'timeline',
        question: 'Dans quel délai souhaitez-vous atteindre cet objectif ?',
        type: 'select',
        options: ['3 mois', '6 mois', '1 an', '2 ans et plus'],
      }
    ]
  }
];

export default function ProfileOnboarding({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentMicroStepIndex, setCurrentMicroStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentStep = onboardingSteps[currentStepIndex];
  const currentMicroStep = currentStep.microSteps[currentMicroStepIndex];
  const totalSteps = onboardingSteps.length;
  const totalMicroSteps = onboardingSteps.reduce((acc, step) => acc + step.microSteps.length, 0);
  const completedMicroSteps = onboardingSteps.slice(0, currentStepIndex).reduce((acc, step) => acc + step.microSteps.length, 0) + currentMicroStepIndex;
  const progress = (completedMicroSteps / totalMicroSteps) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentStep.id}.${currentMicroStep.id}`]: value
    }));
  };

  const handleNext = async () => {
    const currentAnswer = answers[`${currentStep.id}.${currentMicroStep.id}`];
    
    if (currentMicroStep.validation && !currentMicroStep.validation(currentAnswer)) {
      toast({
        title: "Erreur",
        description: currentMicroStep.errorMessage || "Veuillez vérifier votre réponse",
        variant: "destructive",
      });
      return;
    }

    if (currentMicroStepIndex < currentStep.microSteps.length - 1) {
      setCurrentMicroStepIndex(prev => prev + 1);
    } else if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCurrentMicroStepIndex(0);
    } else {
      // Onboarding completed
      setIsSubmitting(true);
      try {
        await updateProfile(userId, {
          onboarding_completed: true,
          onboarding_answers: answers,
          updated_at: new Date().toISOString(),
        });
        toast({
          title: "Félicitations !",
          description: "Votre profil a été complété avec succès.",
        });
        onComplete();
      } catch (error) {
        console.error('Error saving onboarding answers:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos réponses",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderInput = () => {
    switch (currentMicroStep.type) {
      case 'text':
        return (
          <Input
            value={answers[`${currentStep.id}.${currentMicroStep.id}`] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentMicroStep.placeholder}
            className="mt-2"
          />
        );
      case 'select':
        return (
          <Select
            value={answers[`${currentStep.id}.${currentMicroStep.id}`] || ''}
            onValueChange={handleAnswer}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Sélectionnez une option" />
            </SelectTrigger>
            <SelectContent>
              {currentMicroStep.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {currentMicroStep.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={answers[`${currentStep.id}.${currentMicroStep.id}`]?.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = answers[`${currentStep.id}.${currentMicroStep.id}`] || [];
                    handleAnswer(
                      checked
                        ? [...currentValue, option]
                        : currentValue.filter((v: string) => v !== option)
                    );
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentStepIndex}-${currentMicroStepIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-xl mx-auto"
      >
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Étape {currentStepIndex + 1} sur {totalSteps}
          </p>
        </div>

        <Card className="p-6">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{currentStep.title}</h2>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>

            <div className="py-4">
              <h3 className="text-lg font-medium mb-4">{currentMicroStep.question}</h3>
              {renderInput()}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {currentStepIndex === onboardingSteps.length - 1 && 
                 currentMicroStepIndex === currentStep.microSteps.length - 1
                  ? (isSubmitting ? "Finalisation..." : "Terminer")
                  : "Continuer"}
              </Button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
} 