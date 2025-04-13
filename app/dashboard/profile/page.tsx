"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { supabase, updateProfile as updateProfileApi } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileOnboarding from '@/components/onboarding/ProfileOnboarding'

interface Profile {
  id: string
  full_name: string
  avatar_url: string
  onboarding_completed: boolean
  updated_at?: string
}

interface UpdateProfileResponse {
  error: Error | null
  data: Profile | null
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    id: '',
    full_name: '',
    avatar_url: '',
    onboarding_completed: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profileData) {
          setProfile(profileData)
          if (!profileData.onboarding_completed) {
            setShowOnboarding(true)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, router, toast])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setIsUpdating(true)
    
    try {
      const updates = {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        onboarding_completed: profile.onboarding_completed,
        updated_at: new Date().toISOString()
      }
      
      const data = await updateProfileApi(user.id, updates)
      
      if (!data) throw new Error('Failed to update profile')
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your profile</p>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <ProfileOnboarding
        userId={user.id}
        onComplete={() => {
          setShowOnboarding(false)
          setProfile(prev => ({ ...prev, onboarding_completed: true }))
          toast({
            title: 'Welcome!',
            description: 'Your profile is now set up.'
          })
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback>{profile.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{profile.full_name || 'My Profile'}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="flex justify-between">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 