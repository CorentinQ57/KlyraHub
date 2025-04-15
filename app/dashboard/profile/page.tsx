"use client"

import { useEffect, useState } from 'react'
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
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const router = useRouter()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && user) {
      loadProfile()
    } else if (!authLoading && !user) {
      console.log('No authenticated user found, redirecting to login')
      router.push('/login')
    }
  }, [user, authLoading, router])

  async function loadProfile() {
    setLoadError(false)
    setIsLoading(true)
    
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      setEmail(user.email || '')

      const profileData = await getProfileData(user.id)
      
      if (profileData) {
        setFullName(profileData.full_name || '')
        setAvatarUrl(profileData.avatar_url || '')
      } else {
        console.warn('Profile data not found for user')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setLoadError(true)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données du profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour mettre à jour votre profil",
        variant: "destructive",
      })
      return
    }
    
    setIsUpdating(true)
    
    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString()
      }
      
      const updatedProfile = await updateProfile(user.id, updates)
      
      if (updatedProfile) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "Erreur",
        description: "Problème lors de la déconnexion. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Vérification de l'authentification...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement des données de profil...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (loadError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">Erreur de chargement</h3>
            <p className="text-[14px] text-[#64748B] mb-4">
              Impossible de charger les données de profil
            </p>
            <Button onClick={() => loadProfile()}>
              Réessayer
            </Button>
            <div className="mt-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Votre profil"
        description="Gérez vos informations personnelles"
      >
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PageSection title="Informations personnelles">
            <ContentCard>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-medium text-[#1A2333]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-[#F8FAFC] h-10 rounded-lg border-[#E2E8F0]"
                    />
                    <p className="text-[13px] text-[#64748B]">
                      Pour changer votre email, contactez le support
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[14px] font-medium text-[#1A2333]">Nom d'utilisateur</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isUpdating}
                      className="h-10 rounded-lg border-[#E2E8F0]"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? "Mise à jour..." : "Enregistrer les modifications"}
                  </Button>
                </div>
              </form>
            </ContentCard>
          </PageSection>
        </div>
        
        <div>
          <PageSection title="Sécurité du compte">
            <ContentCard className="space-y-6">
              <div className="flex items-start space-x-4 pb-6 border-b border-[#E2E8F0]">
                <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] flex-shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[16px] font-medium">Mot de passe</h4>
                  <p className="text-[13px] text-[#64748B] mb-2">
                    Mettez à jour votre mot de passe pour sécuriser votre compte
                  </p>
                  <Link href="/reset-password">
                    <Button variant="outline" size="sm">Changer</Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 pt-2">
                <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="space-y-1">
                    <h4 className="text-[16px] font-medium">Détails du compte</h4>
                    <p className="text-[13px] text-[#64748B]">
                      {email}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Membre depuis {user ? new Date(user.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  )
} 