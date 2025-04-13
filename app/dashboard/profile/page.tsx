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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des données de profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Votre profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>
      
      <div className="border rounded-lg p-6 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">{fullName || 'Utilisateur'}</h2>
              <p className="text-muted-foreground mb-4">{email}</p>
            </div>
            
            <div className="grid gap-4 pt-2">
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
                <Label htmlFor="fullName">Nom d'utilisateur</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
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
      </div>
      
      <div className="border rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Sécurité du compte</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Changer de mot de passe</h3>
              <p className="text-sm text-muted-foreground">
                Mettez à jour votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <Link href="/reset-password">
              <Button variant="outline">Changer</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 