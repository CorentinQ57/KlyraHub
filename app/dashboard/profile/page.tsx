"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import NextImage from "next/image";
import { FiLogOut } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProfileCustomization from "@/components/ProfileCustomization";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Trophy, Award, Crown, Rocket, Zap, Target, Star } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { Badge } from "@/components/ui/badge";

// Crée un composant personnalisé pour Palette si l'icône n'est pas disponible
const Palette = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="13.5" cy="6.5" r="2.5" />
    <circle cx="19" cy="12" r="2.5" />
    <circle cx="13.5" cy="17.5" r="2.5" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <path d="M6.5 17.5v-11" />
  </svg>
);

// Import the Loading component or create a simple one if it doesn't exist
const Loading = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
      <p className="mt-4 text-lg">Chargement des données de profil...</p>
    </div>
  </div>
);

interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  teamSize: number;
  sector: string;
  experience: string;
  webPresence: string[];
  priorities: string[];
  skills: Record<string, number>;
  visualStyle: string;
  communicationStyle: string;
  deadlineStyle: string;
  profilePicture: string;
  socialLinks: Record<string, string>;
  funFact: string;
  badges: string[];
  level: number;
  xp: number;
}

// Type pour les badges/réalisations
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: Date | null;
  category: 'profile' | 'projects' | 'activity' | 'social';
  requiredPoints?: number;
}

export default function ProfilePage() {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const router = useRouter();
  const { toast } = useToast();
  
  // État pour les succès et réalisations
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState(75); // Simuler les points de l'utilisateur

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
        setIsOnboarding(!hasCompletedOnboarding);
        
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleOnboardingComplete = (profileData: UserProfile) => {
    setProfile(profileData);
    setIsOnboarding(false);
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    localStorage.setItem("hasCompletedOnboarding", "true");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Simuler un délai d'enregistrement
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mettre à jour l'état utilisateur local
      if (user) {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
        };
        setUser(updatedUser);
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = async () => {
    // Dans une application réelle, vous effectueriez la déconnexion ici
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
    
    // Rediriger vers la page de connexion
    router.push("/login");
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (isOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1">
            <div className="bg-primary/10 text-primary rounded-full p-1">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-muted-foreground">{profile?.company}</p>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {profile?.badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Niveau {profile?.level}</span>
            <span>{profile?.xp} / 1000 XP</span>
          </div>
          <Progress value={(profile?.xp || 0) / 10} className="h-2" />
        </div>
      </Card>

      {/* Profile Sections */}
      <div className="grid gap-6">
        {/* Professional Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ton univers pro</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Secteur</p>
                <p className="font-medium">{profile?.sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expérience</p>
                <p className="font-medium">{profile?.experience}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Présence web</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.webPresence.map((presence) => (
                  <Badge key={presence} variant="outline">
                    {presence}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Skills & Priorities */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tes compétences</h2>
          <div className="space-y-4">
            {Object.entries(profile?.skills || {}).map(([skill, level]) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{skill}</span>
                  <span>{level}%</span>
                </div>
                <Progress value={level} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Style Preferences */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ton style</h2>
          <div className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Préférences visuelles</p>
              <p className="font-medium">{profile?.visualStyle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Style de communication</p>
              <p className="font-medium">{profile?.communicationStyle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avec les deadlines</p>
              <p className="font-medium">{profile?.deadlineStyle}</p>
            </div>
          </div>
        </Card>

        {/* Fun Fact */}
        {profile?.funFact && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Fun fact</h2>
            <p className="text-muted-foreground">{profile.funFact}</p>
          </Card>
        )}
      </div>
    </div>
  );
}