'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageContainer, PageHeader, PageSection } from '@/components/ui/page-container';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { saveOnboardingData } from '@/lib/supabase';
import ProgressBar from '@/components/onboarding/ProgressBar';
import StepWelcome from '@/components/onboarding/steps/StepWelcome';
import StepProfile from '@/components/onboarding/steps/StepProfile';
import StepStyle from '@/components/onboarding/steps/StepStyle';
import StepSummary from '@/components/onboarding/steps/StepSummary';
import { supabase } from '@/lib/supabase';

const steps = [
  'Bienvenue',
  'Profil & Besoins',
  'Préférences',
  'Récapitulatif',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, reloadAuthState } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    console.log('Onboarding page - User state:', { 
      isLoading, 
      isAuthenticated: !!user, 
      metadata: user?.user_metadata, 
    });
    
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepComplete = (stepData: any) => {
    // Update formData with the new data from the current step
    setFormData({
      ...formData,
      ...stepData,
    });
    
    // If it's the last step, submit the onboarding data
    if (currentStep === steps.length - 1) {
      handleSubmitOnboarding({
        ...formData,
        ...stepData,
      });
    } else {
      // Otherwise, go to the next step
      goToNextStep();
    }
  };
  
  const handleSubmitOnboarding = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      console.log('Saving onboarding data for user:', user.email, 'with data:', data);
      
      // Sauvegarder les données d'onboarding
      await saveOnboardingData(user.id, data);
      
      // Force a reload of the auth state to get the updated user metadata
      await reloadAuthState();
      
      // Attendre un court délai pour s'assurer que les données d'authentification sont bien mises à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Vérifions que la session est toujours valide après le reloadAuthState
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      console.log('Onboarding completed, session check:', 
        currentSession ? 'Valid session' : 'No session', 
        'User:', user);
      
      // Afficher un toast de succès
      toast({
        title: 'Profil complété !',
        description: 'Bienvenue sur Klyra Hub. Vos préférences ont été enregistrées.',
        duration: 5000,
      });
      
      // S'assurer que les tokens sont correctement stockés dans le localStorage
      if (!currentSession) {
        console.warn('Session perdue après onboarding, tentative de récupération...');
        
        // Tenter de rafraîchir la session avant la redirection
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Impossible de restaurer la session:', refreshError);
          // Rediriger vers la page de connexion avec un message
          toast({
            title: 'Session expirée',
            description: 'Veuillez vous reconnecter pour accéder à votre dashboard.',
            variant: 'destructive',
            duration: 5000,
          });
          
          // Délai plus long pour permettre l'affichage du toast avant la redirection
          setTimeout(() => {
            router.push('/login?redirect=/dashboard&message=session_expired');
          }, 1000);
          return;
        }
        
        console.log('Session récupérée avec succès');
      }
      
      // Rediriger vers le dashboard avec un délai suffisant pour que les tokens soient bien enregistrés
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
      
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Une erreur est survenue',
        description: 'Impossible d\'enregistrer vos informations. Veuillez réessayer.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
    case 0:
      return <StepWelcome data={formData} onComplete={handleStepComplete} />;
    case 1:
      return <StepProfile data={formData} onComplete={handleStepComplete} />;
    case 2:
      return <StepStyle data={formData} onComplete={handleStepComplete} />;
    case 3:
      return <StepSummary data={formData} onComplete={handleStepComplete} />;
    default:
      return null;
    }
  };
  
  // Fonction pour réinitialiser l'état d'onboarding (utile pour tester)
  const resetOnboardingStatus = async () => {
    if (!user) {
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          onboarded: false,
        },
      });
      
      if (error) {
        console.error('Erreur lors de la réinitialisation du statut d\'onboarding:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de réinitialiser le statut d\'onboarding.',
          variant: 'destructive',
        });
        return;
      }
      
      // Rafraîchir l'état d'authentification
      await reloadAuthState();
      
      toast({
        title: 'Statut réinitialisé',
        description: 'Le statut d\'onboarding a été réinitialisé avec succès.',
      });
      
      // Recharger la page pour refléter les changements
      window.location.reload();
    } catch (error) {
      console.error('Exception lors de la réinitialisation du statut d\'onboarding:', error);
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Bienvenue sur Klyra Hub"
        description="Configurons votre profil en quelques étapes simples"
      />
      
      {/* Bouton de réinitialisation - visible uniquement si l'utilisateur a déjà complété l'onboarding */}
      {user?.user_metadata?.onboarded && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-2">
            Vous avez déjà complété l'onboarding, mais vous pouvez le refaire si nécessaire.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetOnboardingStatus}
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
          >
            Réinitialiser mon statut d'onboarding
          </Button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <ProgressBar steps={steps} currentStep={currentStep} />
        
        <PageSection className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              
              <Button
                onClick={goToNextStep}
                disabled={currentStep === steps.length - 1 || isSubmitting}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </PageSection>
      </div>
    </PageContainer>
  );
} 