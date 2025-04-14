"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { updateProfile, getProfileData } from '@/lib/supabase'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { User, KeyRound, ArrowLeft, Save, LogOut } from 'lucide-react'

export default function ProfilePage() {
  // Consolidated state management
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  })
  const [status, setStatus] = useState({
    isLoading: true,
    isUpdating: false
  })
  
  const router = useRouter()
  const { user, signOut, ensureUserProfile } = useAuth()
  const { toast } = useToast()

  // Load profile data from Supabase - Défini avec useCallback pour stabiliser la référence
  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    setStatus(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Set email from auth data
      setProfileData(prev => ({ ...prev, email: user.email || '' }))
      
      // Fetch additional profile data
      const data = await getProfileData(user.id)
      
      if (data) {
        setProfileData(prev => ({ 
          ...prev, 
          fullName: data.full_name || '' 
        }))
      } else {
        toast({
          title: "Information",
          description: "Certaines données du profil n'ont pas pu être chargées.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive",
      })
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }))
    }
  }, [user, toast]);

  // Effect to load profile data when user is available
  useEffect(() => {
    let isMounted = true;
    
    const initProfile = async () => {
      if (!user || !isMounted) return;
      
      try {
        await ensureUserProfile(user.id);
        
        // Seulement si le composant est toujours monté
        if (isMounted) {
          loadProfile();
        }
      } catch (error) {
        console.error('Error initializing profile:', error);
      }
    };
    
    // N'exécutez initProfile que si l'utilisateur est présent et que les données ne sont pas déjà chargées
    if (user && status.isLoading) {
      initProfile();
    } else if (!user && !status.isLoading) {
      // Rediriger si l'utilisateur n'est pas présent et que le chargement est terminé
      router.push('/login');
    }
    
    return () => {
      isMounted = false;
    };
  // Dépendances améliorées pour éviter les rendus en boucle
  }, [user, router, status.isLoading, loadProfile, ensureUserProfile]);

  // Handle profile update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setStatus(prev => ({ ...prev, isUpdating: true }))
    
    try {
      const updates = {
        id: user.id,
        full_name: profileData.fullName,
        updated_at: new Date().toISOString()
      }
      
      const updatedProfile = await updateProfile(user.id, updates)
      
      if (updatedProfile) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      })
    } finally {
      setStatus(prev => ({ ...prev, isUpdating: false }))
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Loading state
  if (status.isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-sm text-[#64748B]">Chargement du profil...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Votre profil"
        description="Gérez vos informations personnelles et paramètres de sécurité"
      >
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          size="sm"
          className="h-9 text-sm font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ContentCard className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center mb-6 pb-4 border-b border-[#E2E8F0]">
              <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] mr-3">
                <User className="h-5 w-5" />
              </div>
              <h3>Informations personnelles</h3>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-[#1A2333] font-medium">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="mt-1.5 bg-[#F8FAFC]"
                  />
                  <p className="text-xs text-[#64748B] mt-1">
                    Pour changer votre email, contactez le support
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="fullName" className="text-[#1A2333] font-medium">Nom d'utilisateur</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={status.isUpdating}
                    className="mt-1.5"
                  />
                </div>
              </div>
              
              <div className="flex justify-end border-t border-[#E2E8F0] pt-4">
                <Button
                  type="submit"
                  disabled={status.isUpdating}
                  size="sm"
                  className="h-9 text-sm font-medium"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {status.isUpdating ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </ContentCard>
        </div>
        
        <div className="md:col-span-1">
          <ContentCard className="h-full overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center mb-6 pb-4 border-b border-[#E2E8F0]">
              <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] mr-3">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3>Sécurité</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium text-[#1A2333]">Mot de passe</h4>
                <p className="text-sm text-[#64748B] mb-3">
                  Mettez à jour régulièrement votre mot de passe
                </p>
                <Link href="/reset-password">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 text-sm font-medium"
                  >
                    Changer le mot de passe
                  </Button>
                </Link>
              </div>
              
              <div className="pt-4 border-t border-[#E2E8F0]">
                <h4 className="font-medium mb-2 text-[#1A2333]">Détails du compte</h4>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Email: {profileData.email}</p>
                  <p className="text-sm text-[#64748B]">
                    Membre depuis: {user ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-[#64748B] hover:text-[#1A2333]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </PageContainer>
  )
} 