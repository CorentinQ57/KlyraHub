"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Trophy, Sparkles, Star, BadgePlus, Palette, BookOpen, Medal, Crown, Zap, Gem, Target, Award, Droplet, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system' | 'blue' | 'green' | 'purple' | 'sunset';
type AvatarFrame = 'none' | 'circle' | 'hexagon' | 'square' | 'star' | 'premium' | 'diamond' | 'crown';
type BadgePosition = 'top' | 'bottom' | 'left' | 'right';

type ProfileLevel = {
  level: number;
  title: string;
  requiredPoints: number;
  unlocksFeature: string;
  icon: React.ReactNode;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactNode;
  points: number;
}

interface Level {
  level: number;
  title: string;
  description: string;
  rewards: string[];
  icon: React.ReactNode;
  pointsRequired: number;
  unlocksFeature?: string;
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
  const [badgePosition, setBadgePosition] = useState<BadgePosition>('right');
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [customAnimations, setCustomAnimations] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Définition des niveaux de progression
  const levels: Level[] = [
    {
      level: 1,
      title: 'Débutant',
      description: 'Premiers pas sur Klyra',
      rewards: ['Accès aux projets de base', 'Support communautaire'],
      icon: <Star className="h-5 w-5" />,
      pointsRequired: 0,
      unlocksFeature: 'basic_projects'
    },
    {
      level: 2,
      title: 'Intermédiaire',
      description: 'Explorer les fonctionnalités avancées',
      rewards: ['Projets avancés', 'Support prioritaire'],
      icon: <Star className="h-5 w-5" />,
      pointsRequired: 150,
      unlocksFeature: 'advanced_projects'
    },
    {
      level: 3,
      title: 'Expert',
      description: 'Maîtrise complète de Klyra',
      rewards: ['Projets illimités', 'Support dédié', 'Fonctionnalités premium'],
      icon: <Star className="h-5 w-5" />,
      pointsRequired: 300,
      unlocksFeature: 'premium_features'
    },
  ];

  // Achievements
  const achievements: Achievement[] = [
    {
      id: 'first-project',
      title: 'Premier Projet',
      description: 'Créez votre premier projet sur Klyra',
      unlocked: true,
      icon: <Users className="h-5 w-5" />,
      points: 100
    },
    {
      id: 'complete-profile',
      title: 'Profil Complet',
      description: 'Complétez toutes les sections de votre profil',
      unlocked: true,
      icon: <MessageSquare className="h-5 w-5" />,
      points: 50
    },
    {
      id: "team_builder",
      title: "Chef d'Équipe",
      description: "Inviter 3 collaborateurs à rejoindre vos projets",
      unlocked: false,
      icon: <Users className="h-5 w-5" />,
      points: 0
    },
    {
      id: "design_master",
      title: "Maître du Design",
      description: "Personnaliser l'apparence de 5 projets",
      unlocked: false,
      icon: <Palette className="h-5 w-5" />,
      points: 0
    },
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
        const levelProgress = ((points - userLevel.pointsRequired) / 
          (nextLevel.pointsRequired - userLevel.pointsRequired)) * 100;
        setProgress(Math.floor(levelProgress));
      } else {
        setProgress(100); // Niveau max atteint
      }
    };
    
    mockFetchUserProgress();
  }, []);

  // Calculer le niveau en fonction des points
  const calculateLevel = (points: number): Level => {
    // Trouver le niveau le plus élevé que l'utilisateur a atteint
    const currentLevel = [...levels]
      .reverse()
      .find(level => points >= level.pointsRequired);
      
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
      const levelProgress = ((newPoints - newUserLevel.pointsRequired) / 
        (nextLevel.pointsRequired - newUserLevel.pointsRequired)) * 100;
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
    { title: "Avatar", component: AvatarFrameSelector },
    { title: "Badges", component: BadgeSelector },
    { title: "Réalisations", component: AchievementsDisplay }
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
          
          {(['blue', 'green', 'purple', 'sunset'] as const).map(theme => {
            const isUnlocked = isFeatureUnlocked(4);
            const themeColors = {
              blue: '#0F172A',
              green: '#0F2A1A',
              purple: '#2A0F2A',
              sunset: 'linear-gradient(to right, #FF512F, #DD2476)'
            } as const;
            
            return (
              <div key={theme}>
                <RadioGroupItem 
                  value={theme} 
                  id={`theme-${theme}`} 
                  className="peer sr-only"
                  disabled={!isUnlocked}
                />
                <Label
                  htmlFor={`theme-${theme}`}
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                    !isUnlocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div 
                    className="rounded-md border border-gray-200 w-full h-20 mb-2 relative"
                    style={{ background: themeColors[theme] }}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                    {!isUnlocked && (
                      <span className="text-xs text-muted-foreground">(Niveau 4)</span>
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
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
    const frames = [
      { id: 'none', name: 'Aucun', level: 1 },
      { id: 'circle', name: 'Cercle', level: 1 },
      { id: 'square', name: 'Carré', level: 1 },
      { id: 'hexagon', name: 'Hexagone', level: 3 },
      { id: 'star', name: 'Étoile', level: 3 },
      { id: 'premium', name: 'Premium', level: 5 },
      { id: 'diamond', name: 'Diamant', level: 5 },
      { id: 'crown', name: 'Couronne', level: 6 }
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
                  {getAvatarFramePreview(frame.id)}
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

  // Fonction utilitaire pour obtenir l'aperçu du cadre d'avatar
  function getAvatarFramePreview(frameId: string) {
    switch (frameId) {
      case 'none':
        return <div className="w-10 h-10 bg-gray-200 rounded-md"></div>;
      case 'circle':
        return <div className="w-10 h-10 bg-gray-200 rounded-full"></div>;
      case 'square':
        return <div className="w-10 h-10 bg-gray-200 rounded-md"></div>;
      case 'hexagon':
        return <div className="w-10 h-10 bg-gray-200 rounded-md transform rotate-45"></div>;
      case 'star':
        return <Star className="w-10 h-10 text-gray-200 fill-gray-200" />;
      case 'premium':
        return (
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        );
      case 'diamond':
        return (
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
            <Gem className="w-6 h-6 text-white" />
          </div>
        );
      case 'crown':
        return (
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 to-red-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
        );
      default:
        return <div className="w-10 h-10 bg-gray-200 rounded-md"></div>;
    }
  }

  // Nouveau composant pour la sélection des badges
  function BadgeSelector() {
    const isUnlocked = isFeatureUnlocked(6);
    
    const badges = [
      { id: 'verified', icon: <CheckCircle2 />, name: 'Vérifié' },
      { id: 'premium', icon: <Crown />, name: 'Premium' },
      { id: 'expert', icon: <Award />, name: 'Expert' },
      { id: 'innovator', icon: <Zap />, name: 'Innovateur' }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Badges
          {!isUnlocked && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Débloqué au niveau 6)
            </span>
          )}
        </h3>

        {isUnlocked ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {badges.map(badge => (
                <button
                  key={badge.id}
                  onClick={() => {
                    setSelectedBadges(prev => 
                      prev.includes(badge.id)
                        ? prev.filter(id => id !== badge.id)
                        : [...prev, badge.id]
                    );
                  }}
                  className={cn(
                    "border-2 rounded-md p-3 flex items-center gap-2",
                    selectedBadges.includes(badge.id) ? "border-primary" : "border-muted"
                  )}
                >
                  {badge.icon}
                  <span>{badge.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Position des badges</h4>
              <RadioGroup 
                value={badgePosition}
                onValueChange={(value) => setBadgePosition(value as BadgePosition)}
                className="grid grid-cols-2 gap-2"
              >
                {['top', 'bottom', 'left', 'right'].map(position => (
                  <div key={position}>
                    <RadioGroupItem 
                      value={position} 
                      id={`position-${position}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`position-${position}`}
                      className="flex items-center justify-center p-2 border rounded-md peer-data-[state=checked]:border-primary"
                    >
                      {position.charAt(0).toUpperCase() + position.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-4 bg-muted/50 flex items-center justify-center flex-col gap-2 h-48">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Atteindre le niveau 6 pour débloquer</p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Nouveau composant pour l'affichage des réalisations
  function AchievementsDisplay() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Réalisations</h3>
        <div className="grid gap-3">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={cn(
                "border rounded-md p-3",
                unlockedAchievements.includes(achievement.id)
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  unlockedAchievements.includes(achievement.id)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{achievement.points} points</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function LevelsSection() {
    const currentLevel = 2;
    const currentXP = 750;
    const nextLevelXP = 1000;
    const progress = (currentXP / nextLevelXP) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Niveau {currentLevel}</h3>
            <p className="text-sm text-muted-foreground">
              {levels[currentLevel - 1].description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{currentXP} / {nextLevelXP} XP</p>
            <Progress value={progress} className="w-[200px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levels.map((level) => (
            <div
              key={level.level}
              className={cn(
                "p-4 rounded-lg border",
                level.level === currentLevel
                  ? "bg-primary/10 border-primary"
                  : level.level < currentLevel
                  ? "bg-muted"
                  : "opacity-50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {level.icon}
                <h4 className="font-medium">Niveau {level.level}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
              <ul className="text-sm space-y-1">
                {level.rewards.map((reward, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function AchievementsSection() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "p-4 rounded-lg border",
              achievement.unlocked ? "bg-primary/10 border-primary" : "opacity-50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {achievement.icon}
              <h4 className="font-medium">{achievement.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {achievement.unlocked && (
              <p className="text-sm text-primary mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Débloqué
              </p>
            )}
          </div>
        ))}
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