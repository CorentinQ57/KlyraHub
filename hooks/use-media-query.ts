'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si le viewport est de taille mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Vérification initiale
    checkIfMobile();
    
    // Ajouter un listener pour les changements de taille d'écran
    window.addEventListener('resize', checkIfMobile);
    
    // Nettoyage lors du démontage du composant
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return { isMobile };
} 