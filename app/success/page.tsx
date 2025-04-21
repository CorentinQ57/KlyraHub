'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { createProject } from '@/lib/supabase';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Récupérer les paramètres de l'URL
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (sessionId) {
        // Attendre 2 secondes pour laisser le temps au webhook de créer le projet
        setTimeout(() => {
          setStatus('success');
          // Rediriger vers le dashboard après 3 secondes supplémentaires
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }, 2000);
      } else {
        setStatus('error');
        setError('Session de paiement non trouvée.');
      }
    }
  }, [user, isLoading, sessionId, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-klyra mx-auto" />
          <p className="text-lg">Finalisation de votre commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-8">
          {status === 'success' ? (
            <>
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Paiement réussi !</h1>
                <p className="text-muted-foreground">
                  Votre projet a été créé avec succès. Vous allez être redirigé vers votre dashboard...
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-klyra hover:bg-klyra/90"
              >
                Aller au dashboard maintenant
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-full bg-red-100 p-3 mx-auto w-fit">
                <span className="text-red-600 text-4xl">!</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-red-600">Une erreur est survenue</h1>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-klyra hover:bg-klyra/90 w-full"
                >
                  Retourner au dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 