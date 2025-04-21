import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type pour les headings utilisés dans la génération de tables des matières
type Heading = {
  id: string;
  title: string;
  icon?: React.ElementType;
  level?: number;
};

// Fonction pour générer des items de table des matières à partir d'une liste de headings
export function generateToc(headings: Heading[]) {
  return headings.map(heading => ({
    id: heading.id,
    title: heading.title,
    level: heading.level || 2,
  }));
}
