"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const ServiceIconAnimation = () => {
  useEffect(() => {
    // Fonction pour ajouter une animation aléatoire aux icônes
    const randomizeIconAnimations = () => {
      const icons = document.querySelectorAll('.service-icon-container');
      const animations = ['icon-pulse', 'icon-float', 'icon-spin', 'icon-bounce', 'icon-glow'];
      const durations = ['duration-slow', 'duration-medium', 'duration-fast'];
      const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
      
      icons.forEach((icon) => {
        // Retirer toutes les classes d'animation existantes
        animations.forEach(anim => icon.classList.remove(anim));
        durations.forEach(dur => icon.classList.remove(dur));
        delays.forEach(del => icon.classList.remove(del));
        
        // Ajouter une animation aléatoire
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        const randomDuration = durations[Math.floor(Math.random() * durations.length)];
        const randomDelay = delays[Math.floor(Math.random() * delays.length)];
        
        // Ajouter les nouvelles classes
        icon.classList.add(randomAnimation, randomDuration, randomDelay);
      });
    };
    
    // Initialiser les animations au chargement
    randomizeIconAnimations();
    
    // Mettre en place un effet de suivi de la souris pour les icônes
    const handleMouseMove = (e: MouseEvent) => {
      const serviceCards = document.querySelectorAll('.service-card');
      
      serviceCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (
          x >= 0 && 
          x <= rect.width && 
          y >= 0 && 
          y <= rect.height
        ) {
          const cardIcon = card.querySelector('.service-icon-container');
          if (cardIcon) {
            // Calculer le déplacement relatif (max 5px dans chaque direction)
            const moveX = ((x / rect.width) - 0.5) * 10;
            const moveY = ((y / rect.height) - 0.5) * 10;
            
            // Appliquer la transformation
            cardIcon.setAttribute('style', `transform: translate(${moveX}px, ${moveY}px)`);
          }
        }
      });
    };
    
    // Ajouter les écouteurs d'événements
    document.addEventListener('mousemove', handleMouseMove);
    
    // Nettoyage
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return null; // Ce composant n'affiche rien, il gère seulement les animations
};

// Composant de fond d'icône qui suit la souris
export const IconHoverEffect = ({ 
  children, 
  active = false
}: { 
  children: React.ReactNode, 
  active?: boolean 
}) => {
  return (
    <motion.div className="relative inline-block service-icon-container">
      {children}
      <AnimatePresence>
        {active && (
          <motion.div 
            className="absolute -inset-4 bg-primary/5 rounded-full -z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServiceIconAnimation; 