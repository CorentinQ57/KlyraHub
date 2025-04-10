"use client"

// Ce composant n'est plus nécessaire car nous utilisons IconHoverEffect.tsx
// Nous gardons un export simple pour maintenir la compatibilité et éviter les erreurs
export const ServiceIconAnimation = () => null;

// Réexporter IconHoverEffect depuis le nouveau fichier pour la rétrocompatibilité
export { IconHoverEffect as default } from './IconHoverEffect'; 