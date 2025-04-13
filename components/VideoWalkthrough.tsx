"use client";

import { useState, useEffect } from 'react';
import { X, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type VideoWalkthroughProps = {
  videoUrl?: string;
  learnMoreUrl?: string;
  showDelay?: number; // en millisecondes
};

export default function VideoWalkthrough({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ", // URL par défaut à remplacer
  learnMoreUrl = "/dashboard/docs",
  showDelay = 500, // Délai avant l'affichage
}: VideoWalkthroughProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Vérifier si la carte a déjà été fermée dans cette session
  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('videoWalkthroughDismissed');
    if (hasBeenDismissed === 'true') {
      setIsDismissed(true);
    } else {
      // Afficher la carte après un délai
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, showDelay);
      
      return () => clearTimeout(timer);
    }
  }, [showDelay]);

  // Fermer la carte
  const dismissCard = () => {
    setIsVisible(false);
    // Marquer comme fermée pour cette session
    localStorage.setItem('videoWalkthroughDismissed', 'true');
    setTimeout(() => {
      setIsDismissed(true);
    }, 300);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-4 bottom-4 z-50 w-72 rounded-lg border bg-white shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-3 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Video Walkthrough</h3>
              <button 
                onClick={dismissCard}
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Watch how the new dashboard works.
            </p>
          </div>
          
          <div className="relative aspect-video w-full cursor-pointer group">
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="rounded-full bg-white/90 p-2 shadow-md group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 text-primary" fill="currentColor" />
              </div>
            </div>
          </div>
          
          <div className="px-4 py-2 flex justify-between items-center">
            <button 
              onClick={dismissCard}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
            
            <Link 
              href={learnMoreUrl}
              className="text-sm text-primary hover:text-primary/80 flex items-center"
            >
              Learn more <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 