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
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { user, signOut, ensureUserProfile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      ensureUserProfile(user.id).finally(() => loadProfile())
    } else if (!isLoading) {
      router.push('/login')
    }
  }, [user, router])

  async function loadProfile() {
    setIsLoading(true)
    try {
      if (!user) return
      
      setEmail(user.email || '')
      const profileData = await getProfileData(user.id)
      
      if (profileData) {
        setFullName(profileData.full_name || '')
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
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Chargement du profil...</p>
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
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentCard>
            <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour changer votre email, contactez le support
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="fullName">Nom d'utilisateur</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isUpdating}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Link href="/dashboard">
                  <Button variant="ghost" type="button">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                </Link>
                
                <Button
                  type="submit"
                  disabled={isUpdating}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </ContentCard>
        </div>
        
        <div>
          <ContentCard>
            <h2 className="text-lg font-semibold mb-4">Sécurité et compte</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 pb-4 border-b border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Mot de passe</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Mettez à jour votre mot de passe régulièrement
                  </p>
                  <Link href="/reset-password">
                    <Button variant="outline" size="sm">Changer</Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Détails du compte</h4>
                  <div className="space-y-1 mt-1 text-xs text-gray-500">
                    <p>{email}</p>
                    <p>Membre depuis {user ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}</p>
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