"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { updateProfile, getProfileData } from '@/lib/supabase'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { User, KeyRound, LogOut, ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  async function loadProfile() {
    setIsLoading(true)
    try {
      if (!user) return
      
      // Set email from auth data
      setEmail(user.email || '')

      // Get additional profile data
      const profileData = await getProfileData(user.id)
      if (profileData) {
        setFullName(profileData.full_name || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
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
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
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
    }
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

  return (
    <PageContainer>
      <div className="flex items-center gap-2 mb-6 text-[14px] text-[#64748B]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-[#64748B] hover:text-[#1A2333]"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
      
      <PageHeader
        title="Votre profil"
        description="Gérez vos informations personnelles et paramètres de sécurité"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PageSection title="Informations personnelles">
            <ContentCard>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-[#F8FAFC]"
                    />
                    <p className="text-[13px] text-[#64748B]">
                      Pour changer votre email, contactez le support
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom d'utilisateur</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={isUpdating}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Mise à jour..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </ContentCard>
          </PageSection>
        </div>
        
        <div className="space-y-6">
          <PageSection title="Sécurité du compte">
            <ContentCard>
              <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-[#E2E8F0]">
                <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] flex-shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Changer de mot de passe</h4>
                  <p className="text-[13px] text-[#64748B]">
                    Mettez à jour régulièrement votre mot de passe pour sécuriser votre compte
                  </p>
                  <Button variant="outline" size="sm" onClick={() => router.push('/reset-password')}>
                    Modifier
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-[#E2E8F0]">
                <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Information de compte</h4>
                  <p className="text-[13px] text-[#64748B]">
                    {email}
                  </p>
                  <p className="text-[13px] text-[#64748B]">
                    Membre depuis {user ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] flex-shrink-0">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Déconnexion</h4>
                  <p className="text-[13px] text-[#64748B]">
                    Déconnectez-vous de votre compte sur cet appareil
                  </p>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </ContentCard>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  )
} 