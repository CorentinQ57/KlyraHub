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
        </Tabs>
      </div>
    </div>
  );
} 