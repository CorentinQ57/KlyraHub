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
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
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

  // Simuler le chargement des données utilisateur
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    const fetchUserData = async () => {
      try {
        // Simulation d'un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Données utilisateur fictives
        const userData = {
          id: "user-123",
          name: "John Doe",
          email: "john.doe@example.com",
          image: "/assets/avatar.png",
          role: "Administrateur"
        };
        
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
        });
        
        // Charger les réalisations de l'utilisateur
        const mockAchievements: Achievement[] = [
          {
            id: "profile-complete",
            title: "Profil Complet",
            description: "Remplir toutes les informations de votre profil",
            icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
            unlockedAt: new Date(2023, 5, 15),
            category: 'profile'
          },
          {
            id: "first-project",
            title: "Premier Projet",
            description: "Lancer votre premier projet sur Klyra",
            icon: <Rocket className="h-10 w-10 text-blue-500" />,
            unlockedAt: new Date(2023, 6, 2),
            category: 'projects'
          },
          {
            id: "customization-master",
            title: "Maître de la Personnalisation",
            description: "Personnaliser entièrement votre profil",
            icon: <Palette className="h-10 w-10 text-purple-500" />,
            unlockedAt: new Date(2023, 6, 10),
            category: 'profile'
          },
          {
            id: "three-projects",
            title: "Triple Projet",
            description: "Lancer trois projets sur Klyra",
            icon: <Award className="h-10 w-10 text-yellow-500" />,
            unlockedAt: null,
            category: 'projects',
            requiredPoints: 150
          },
          {
            id: "community-star",
            title: "Étoile de la Communauté",
            description: "Obtenir cinq commentaires positifs sur vos projets",
            icon: <Star className="h-10 w-10 text-yellow-500" />,
            unlockedAt: null,
            category: 'social',
            requiredPoints: 200
          },
          {
            id: "expert-user",
            title: "Utilisateur Expert",
            description: "Atteindre 6 mois d'activité continue sur la plateforme",
            icon: <Crown className="h-10 w-10 text-orange-500" />,
            unlockedAt: null,
            category: 'activity',
            requiredPoints: 300
          },
        ];
        
        setAchievements(mockAchievements);
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

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

  if (loading) {
    return <Loading />;
  }

  // Function to handle customization updates
  const handleCustomizationUpdate = async (data: any) => {
    // Here you would implement the logic to save customization data
    console.log("Customization data:", data);
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <FiLogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
        
        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Compte</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="customization">Personnalisation</TabsTrigger>
            <TabsTrigger value="achievements">Succès</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles ici.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                        <NextImage
                          src={user?.image || "/assets/avatar-placeholder.png"}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{user?.name}</h3>
                        <p className="text-sm text-muted-foreground">{user?.role}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          Changer d'avatar
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez les paramètres de sécurité de votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Mettre à jour le mot de passe</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customization">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de votre profil et débloquez de nouvelles fonctionnalités.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileCustomization 
                  userId={user?.id || "user-123"} 
                  onUpdate={handleCustomizationUpdate} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Récompenses et Badges</CardTitle>
                <CardDescription>
                  Suivez votre progression et débloquez des badges en utilisant Klyra.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* En-tête avec points et progression */}
                  <div className="bg-muted/40 rounded-lg p-4 border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-full p-1.5">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Explorateur Klyra</h3>
                          <p className="text-sm text-muted-foreground">{userPoints} points</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">
                          {Math.min(100, Math.floor((userPoints / 300) * 100))}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vers badge Expert
                        </span>
                      </div>
                    </div>
                    
                    <Progress value={Math.min(100, Math.floor((userPoints / 300) * 100))} className="h-2" />
                  </div>
                  
                  {/* Filtres de badges par catégorie */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                    >
                      Tous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                    >
                      Profil
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                    >
                      Projets
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                    >
                      Activité
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full"
                    >
                      Social
                    </Button>
                  </div>
                  
                  {/* Grille de badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.03 }}
                        className={cn(
                          "border rounded-lg p-4 flex flex-col items-center text-center",
                          achievement.unlockedAt ? "bg-green-50" : "bg-muted/20"
                        )}
                      >
                        <div className="relative mb-2">
                          <div className={cn(
                            "rounded-full p-3",
                            achievement.unlockedAt 
                              ? "bg-green-100" 
                              : "bg-muted/40 opacity-60"
                          )}>
                            {achievement.icon}
                          </div>
                          {!achievement.unlockedAt && (
                            <div className="absolute -top-2 -right-2 bg-muted/80 rounded-full p-1">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        
                        {achievement.unlockedAt ? (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>
                              Débloqué le {achievement.unlockedAt.toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            {achievement.requiredPoints && (
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary/40"
                                  style={{ 
                                    width: `${Math.min(100, Math.floor((userPoints / achievement.requiredPoints) * 100))}%` 
                                  }}
                                ></div>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.requiredPoints ? 
                                `${userPoints}/${achievement.requiredPoints} points` : 
                                "Complétez l'objectif pour débloquer"
                              }
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 