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
import { User, KeyRound } from 'lucide-react'

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
      // Vérifier que user existe
      if (!user) {
        return;
      }
      
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
      <PageHeader
        title="Votre profil"
        description="Gérez vos informations personnelles"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ContentCard>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <h3 className="text-[18px] font-semibold mb-4">Informations personnelles</h3>
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
                  {isUpdating ? "Mise à jour..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </ContentCard>
        </div>
        
        <div>
          <ContentCard>
            <div className="space-y-6">
              <h3 className="text-[18px] font-semibold mb-4">Sécurité du compte</h3>
              
              <div className="flex items-start space-x-4 pb-6 border-b border-[#E2E8F0]">
                <div className="h-10 w-10 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#467FF7] flex-shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[16px] font-medium">Changer de mot de passe</h4>
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
                    <h4 className="text-[16px] font-medium">Information de compte</h4>
                    <p className="text-[13px] text-[#64748B]">
                      {email}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Membre depuis {user ? new Date(user.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  )
} 