'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Digicode } from '@/components/ui/digicode';

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useLocalStorage('academy-access', false);
  const [showDigicode, setShowDigicode] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà autorisé
    if (isAuthorized) {
      setShowDigicode(false);
    }
  }, [isAuthorized]);

  const handleDigicodeSuccess = () => {
    setIsAuthorized(true);
    setShowDigicode(false);
  };

  if (showDigicode) {
    return <Digicode onSuccess={handleDigicodeSuccess} />;
  }

  return <>{children}</>;
} 