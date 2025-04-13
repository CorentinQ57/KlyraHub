"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase, getProfileData, updateProfile } from '@/lib/supabase'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { OnboardingData } from '@/components/onboarding/types'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    businessName: '',
    role: '',
    sector: '',
    companySize: '',
    projectType: []
  })
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadProfile()
      checkOnboardingStatus()
    }
  }, [user])

  async function loadProfile() {
    setIsLoading(true)
    try {
      if (!user) return
      
      setEmail(user.email || '')

      const profileData = await getProfileData(user.id)
      if (profileData) {
        setFullName(profileData.full_name || '')
        setAvatarUrl(profileData.avatar_url || '')
        if (profileData.onboarding_data) {
          setOnboardingData(profileData.onboarding_data)
        }
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

  async function checkOnboardingStatus() {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_data')
        .eq('id', user?.id)
        .single()

      setHasCompletedOnboarding(profile?.onboarding_completed || false)
      if (profile?.onboarding_data) {
        setOnboardingData(profile.onboarding_data)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    }
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      if (!user) return

      const updates = {
        id: user.id,
        onboarding_completed: true,
        onboarding_data: data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setHasCompletedOnboarding(true)
      setOnboardingData(data)
      toast({
        title: "Onboarding terminé",
        description: "Votre profil a été configuré avec succès",
      })
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast({
        title: "Erreur",
        description: "Impossible de terminer l'onboarding",
        variant: "destructive",
      })
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
        avatar_url: avatarUrl,
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

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return hasCompletedOnboarding ? (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Votre profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>
      
      <div className="border rounded-lg p-6 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  fullName?.charAt(0) || email?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{fullName || 'Utilisateur'}</h2>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>
            
            <div className="grid gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Pour changer votre email, contactez le support
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL de l'avatar</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://exemple.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              type="button"
            >
              Se déconnecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <OnboardingFlow
      data={onboardingData}
      onComplete={handleOnboardingComplete}
    />
  )
} 