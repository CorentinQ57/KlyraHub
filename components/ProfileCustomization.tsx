"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Trophy, Sparkles, Star, BadgePlus, Palette, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system' | 'blue' | 'green' | 'purple';
type AvatarFrame = 'none' | 'circle' | 'hexagon' | 'square' | 'star' | 'premium';

type ProfileLevel = {
  level: number;
  title: string;
  requiredPoints: number;
  unlocksFeature: string;
  icon: React.ReactNode;
}

interface ProfileCustomizationProps {
  userId: string;
  initialData?: {
    theme: Theme;
    accentColor: string;
    avatarFrame: AvatarFrame;
    showBadges: boolean;
  };
  onUpdate: (data: any) => Promise<void>;
}

export default function ProfileCustomization({ 
  userId, 
  initialData = {
    theme: 'system',
    accentColor: '#467FF7',
    avatarFrame: 'circle',
    showBadges: true
  },
  onUpdate 
}: ProfileCustomizationProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialData.theme);
  const [accentColor, setAccentColor] = useState(initialData.accentColor);
  const [avatarFrame, setAvatarFrame] = useState<AvatarFrame>(initialData.avatarFrame);
  const [showBadges, setShowBadges] = useState(initialData.showBadges);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Définition des niveaux de progression
  const levels: ProfileLevel[] = [
    { 
      level: 1, 
      title: "Débutant", 
      requiredPoints: 0, 
      unlocksFeature: "Personnalisation de base",
      icon: <BookOpen className="h-5 w-5" />
    },
    { 
      level: 2, 
      title: "Apprenti", 
      requiredPoints: 50, 
      unlocksFeature: "Couleurs personnalisées",
      icon: <Palette className="h-5 w-5" />
    },
    { 
      level: 3, 
      title: "Expert", 
      requiredPoints: 100, 
      unlocksFeature: "Cadres d'avatar spéciaux",
      icon: <BadgePlus className="h-5 w-5" />
    },
    { 
      level: 4, 
      title: "Maître", 
      requiredPoints: 200, 
      unlocksFeature: "Thèmes exclusifs",
      icon: <Star className="h-5 w-5" />
    },
    { 
      level: 5, 
      title: "Légende", 
      requiredPoints: 500, 
      unlocksFeature: "Personnalisation complète",
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  // Simuler le chargement des points et du niveau de l'utilisateur
  useEffect(() => {
    // Dans une vraie application, ces données viendraient de la base de données
    const mockFetchUserProgress = async () => {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Points fictifs pour la démo (dans une vraie app, ces points viendraient du back-end)
      const points = 75;
      setUserPoints(points);
      
      // Calcul du niveau en fonction des points
      const userLevel = calculateLevel(points);
      setUserLevel(userLevel.level);
      
      // Calcul de la progression vers le niveau suivant
      const nextLevel = levels.find(l => l.level === userLevel.level + 1);
      if (nextLevel) {
        const levelProgress = ((points - userLevel.requiredPoints) / 
          (nextLevel.requiredPoints - userLevel.requiredPoints)) * 100;
        setProgress(Math.floor(levelProgress));
      } else {
        setProgress(100); // Niveau max atteint
      }
    };
    
    mockFetchUserProgress();
  }, []);

  // Calculer le niveau en fonction des points
  const calculateLevel = (points: number): ProfileLevel => {
    // Trouver le niveau le plus élevé que l'utilisateur a atteint
    const currentLevel = [...levels]
      .reverse()
      .find(level => points >= level.requiredPoints);
      
    return currentLevel || levels[0];
  };

  // Simuler un gain de points après une personnalisation
  const awardPoints = async (pointsToAdd: number) => {
    const newPoints = userPoints + pointsToAdd;
    setUserPoints(newPoints);
    
    const previousLevel = userLevel;
    const newUserLevel = calculateLevel(newPoints);
    
    // Mettre à jour le niveau si nécessaire
    if (newUserLevel.level > previousLevel) {
      setUserLevel(newUserLevel.level);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    // Calculer la nouvelle progression
    const nextLevel = levels.find(l => l.level === newUserLevel.level + 1);
    if (nextLevel) {
      const levelProgress = ((newPoints - newUserLevel.requiredPoints) / 
        (nextLevel.requiredPoints - newUserLevel.requiredPoints)) * 100;
      setProgress(Math.floor(levelProgress));
    } else {
      setProgress(100); // Niveau max atteint
    }
  };

  // Déterminer les fonctionnalités débloquées
  const isFeatureUnlocked = (requiredLevel: number) => {
    return userLevel >= requiredLevel;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    setIsUpdating(true);
    
    try {
      const updatedData = {
        theme: currentTheme,
        accentColor,
        avatarFrame,
        showBadges
      };
      
      await onUpdate(updatedData);
      
      // Attribuer des points pour la personnalisation
      await awardPoints(10);
      
    } catch (error) {
      console.error('Error updating profile customization:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Réglage du carrousel de pages
  const pages = [
    { title: "Thème", component: ThemeSelector },
    { title: "Couleurs", component: ColorSelector },
    { title: "Avatar", component: AvatarFrameSelector }
  ];

  // Navigation entre les pages
  const nextPage = () => {
    if (activePage < pages.length - 1) {
      setActivePage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (activePage > 0) {
      setActivePage(prev => prev - 1);
    }
  };

  // Composant de sélection de thème
  function ThemeSelector() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Choisissez votre thème</h3>
        <RadioGroup 
          value={currentTheme}
          onValueChange={(value) => setCurrentTheme(value as Theme)}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem 
              value="light" 
              id="theme-light" 
              className="peer sr-only" 
            />
            <Label
              htmlFor="theme-light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="rounded-md border border-gray-200 bg-[#FAFAFA] w-full h-20 mb-2"></div>
              <span>Clair</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem 
              value="dark" 
              id="theme-dark" 
              className="peer sr-only" 
            />
            <Label
              htmlFor="theme-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="rounded-md border border-gray-200 bg-[#1A1A1A] w-full h-20 mb-2"></div>
              <span>Sombre</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem 
              value="blue" 
              id="theme-blue" 
              className="peer sr-only"
              disabled={!isFeatureUnlocked(4)}
            />
            <Label
              htmlFor="theme-blue"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                !isFeatureUnlocked(4) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="rounded-md border border-gray-200 bg-[#0F172A] w-full h-20 mb-2 relative">
                {!isFeatureUnlocked(4) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span>Océan</span>
                {!isFeatureUnlocked(4) && (
                  <span className="text-xs text-muted-foreground">(Niveau 4)</span>
                )}
              </div>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem 
              value="green" 
              id="theme-green" 
              className="peer sr-only"
              disabled={!isFeatureUnlocked(4)}
            />
            <Label
              htmlFor="theme-green"
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                !isFeatureUnlocked(4) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="rounded-md border border-gray-200 bg-[#0F2A1A] w-full h-20 mb-2 relative">
                {!isFeatureUnlocked(4) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span>Forêt</span>
                {!isFeatureUnlocked(4) && (
                  <span className="text-xs text-muted-foreground">(Niveau 4)</span>
                )}
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
    );
  }

  // Composant de sélection de couleur d'accent
  function ColorSelector() {
    const isUnlocked = isFeatureUnlocked(2);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Couleur d'accent
          {!isUnlocked && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Débloqué au niveau 2)
            </span>
          )}
        </h3>
        
        {isUnlocked ? (
          <div className="space-y-4">
            <div 
              className="w-full h-12 rounded-md flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: accentColor }}
              onClick={() => setShowColorPicker(prev => !prev)}
            >
              <span className="text-white font-medium shadow-sm">
                {accentColor}
              </span>
            </div>
            
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border rounded-md">
                    <HexColorPicker 
                      color={accentColor} 
                      onChange={setAccentColor} 
                      className="w-full" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-5 gap-2">
              {['#467FF7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                <div
                  key={color}
                  className={cn(
                    "w-full h-8 rounded-md cursor-pointer ring-2 ring-transparent hover:ring-gray-400",
                    accentColor === color && "ring-black dark:ring-white"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setAccentColor(color)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-4 bg-muted/50 flex items-center justify-center flex-col gap-2 h-48">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Atteindre le niveau 2 pour débloquer</p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Composant de sélection de cadre d'avatar
  function AvatarFrameSelector() {
    const isBasicUnlocked = true; // Toujours disponible
    const isAdvancedUnlocked = isFeatureUnlocked(3);
    const isPremiumUnlocked = isFeatureUnlocked(5);
    
    const frames = [
      { id: 'none', name: 'Aucun', level: 1 },
      { id: 'circle', name: 'Cercle', level: 1 },
      { id: 'square', name: 'Carré', level: 1 },
      { id: 'hexagon', name: 'Hexagone', level: 3 },
      { id: 'star', name: 'Étoile', level: 3 },
      { id: 'premium', name: 'Premium', level: 5 }
    ];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cadre de votre avatar</h3>
        <div className="grid grid-cols-3 gap-3">
          {frames.map(frame => {
            const isUnlocked = userLevel >= frame.level;
            
            return (
              <div key={frame.id} className="relative">
                <button
                  type="button"
                  onClick={() => isUnlocked && setAvatarFrame(frame.id as AvatarFrame)}
                  className={cn(
                    "border-2 rounded-md p-3 w-full h-24 flex flex-col items-center justify-center gap-2",
                    avatarFrame === frame.id ? "border-primary" : "border-muted",
                    !isUnlocked && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!isUnlocked}
                >
                  {frame.id === 'none' ? (
                    <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  ) : frame.id === 'circle' ? (
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  ) : frame.id === 'square' ? (
                    <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  ) : frame.id === 'hexagon' ? (
                    <div className="w-10 h-10 bg-gray-200 rounded-md transform rotate-45"></div>
                  ) : frame.id === 'star' ? (
                    <Star className="w-10 h-10 text-gray-200 fill-gray-200" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <span className="text-xs">{frame.name}</span>
                </button>
                
                {!isUnlocked && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Niveau {frame.level}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Rendu du composant
  return (
    <div className="space-y-6">
      {/* Barre de progression et niveau */}
      <div className="bg-muted/40 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-full p-1.5">
              {levels.find(l => l.level === userLevel)?.icon || <Trophy className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-medium">Niveau {userLevel}: {levels.find(l => l.level === userLevel)?.title}</h3>
              <p className="text-sm text-muted-foreground">{userPoints} points</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">{progress}%</span>
            <span className="text-xs text-muted-foreground">
              vers niveau {userLevel < levels.length ? userLevel + 1 : "max"}
            </span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {/* Liste de fonctionnalités débloquées */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {levels.map((level) => (
            <div 
              key={level.level}
              className={cn(
                "flex items-center gap-2 text-sm py-1 px-2 rounded-md",
                userLevel >= level.level 
                  ? "text-green-600 bg-green-50" 
                  : "text-muted-foreground bg-muted/20"
              )}
            >
              {userLevel >= level.level ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <Lock className="h-4 w-4 shrink-0" />
              )}
              <span>{level.unlocksFeature}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Carrousel de personnalisation */}
      <div className="border rounded-lg overflow-hidden">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b px-4 py-2">
          <button
            onClick={prevPage}
            disabled={activePage === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Précédent
          </button>
          
          <div className="font-medium">
            {pages[activePage].title}
          </div>
          
          <button
            onClick={nextPage}
            disabled={activePage === pages.length - 1}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        
        {/* Contenu de la page active */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {pages[activePage].component()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Barre d'indicateurs */}
        <div className="flex justify-center gap-1 p-2 border-t">
          {pages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full",
                index === activePage ? "bg-primary" : "bg-muted"
              )}
              onClick={() => setActivePage(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Bouton d'enregistrement */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
      
      {/* Confetti pour les montées de niveau */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="bg-primary/90 text-white p-8 rounded-lg shadow-lg border border-primary-foreground"
          >
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
              <h2 className="text-xl font-bold mb-1">Félicitations!</h2>
              <p className="text-white/90 mb-4">Vous avez atteint le niveau {userLevel}!</p>
              <p className="font-medium">
                {levels.find(l => l.level === userLevel)?.unlocksFeature}
                <br/>débloqué!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 