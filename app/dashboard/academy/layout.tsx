'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Digicode } from '@/components/ui/digicode';

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force le digicode à s'afficher en initialisant isAuthorized à false
  const [isAuthorized, setIsAuthorized] = useLocalStorage('academy-access', false);
  
  // Force l'affichage du digicode en définissant showDigicode à true
  const [showDigicode, setShowDigicode] = useState(true);

  // Réinitialise l'autorisation à chaque visite
  useEffect(() => {
    // Définir isAuthorized à false pour forcer l'affichage du digicode
    setIsAuthorized(false);
  }, [setIsAuthorized]);

  const handleDigicodeSuccess = () => {
    setIsAuthorized(true);
    setShowDigicode(false);
  };

  if (showDigicode) {
    return <Digicode onSuccess={handleDigicodeSuccess} />;
  }

  return <>{children}</>;
} 