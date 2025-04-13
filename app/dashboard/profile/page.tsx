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
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadProfile()
    } else if (!user && !isLoading) {
      router.push('/login')
    }
  }, [user, router])

  async function loadProfile() {
    setIsLoading(true)
    try {
      if (!user) return;
      
      setEmail(user.email || '')

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
        title="Profil"
        description="Gérez vos informations personnelles et la sécurité de votre compte"
      >
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </Link>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageSection>
            <ContentCard>
              <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="mt-1 bg-[#F8FAFC]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isUpdating}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </ContentCard>
          </PageSection>
        </div>
        
        <div>
          <PageSection>
            <ContentCard>
              <h3 className="text-lg font-medium mb-4">Détails du compte</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#64748B]">
                    <User className="inline-block h-4 w-4 mr-1" />
                    {email}
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    Membre depuis {user ? new Date(user.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Sécurité</h4>
                  <Link href="/reset-password">
                    <Button variant="outline" size="sm" className="w-full justify-start mb-2">
                      <KeyRound className="mr-2 h-4 w-4" /> Changer le mot de passe
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
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