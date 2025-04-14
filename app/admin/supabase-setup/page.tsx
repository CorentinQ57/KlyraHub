"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/components/ui/use-toast"

export default function SupabaseSetupPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [databaseTables, setDatabaseTables] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    
    // Redirect if not admin
    if (mounted && !isLoading && (!user || !isAdmin)) {
      toast({
        title: "Erreur",
        description: "Accès non autorisé",
        variant: "destructive",
        duration: 5000,
      })
      router.push('/dashboard')
    }
  }, [user, isAdmin, isLoading, router, mounted])

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Get Supabase URL from environment variable
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        setSupabaseUrl(url || 'Non configurée')
        
        // Test connection
        const { data, error } = await supabase.from('profiles').select('id').limit(1)
        
        if (error) {
          console.error('Erreur de connexion à Supabase:', error)
          setConnectionStatus('error')
          setErrorMessage(error.message)
          return
        }
        
        setConnectionStatus('success')
        
        // Get tables list
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_catalog.pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
        
        if (tablesError) {
          console.error('Erreur lors de la récupération des tables:', tablesError)
          return
        }
        
        if (tablesData) {
          setDatabaseTables(tablesData.map(t => t.tablename))
        }
      } catch (error) {
        console.error('Erreur inattendue:', error)
        setConnectionStatus('error')
        setErrorMessage('Erreur inattendue lors de la vérification de la connexion')
      }
    }
    
    if (mounted && user && isAdmin) {
      checkSupabaseConnection()
    }
  }, [mounted, user, isAdmin])

  // Create a test user for testing
  const createTestUser = async () => {
    try {
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'password123'
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User',
            role: 'client'
          }
        }
      })
      
      if (error) {
        toast({
          title: "Erreur",
          description: `Erreur lors de la création de l'utilisateur: ${error.message}`,
          variant: "destructive",
          duration: 5000,
        })
        return
      }
      
      toast({
        title: "Succès",
        description: `Utilisateur test créé: ${testEmail} (mot de passe: password123)`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: 'Erreur inattendue lors de la création de l\'utilisateur',
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Vérifier et réparer les politiques RLS sur la table profiles
  const verifyAndFixProfilesRLS = async () => {
    try {
      // Vérifier d'abord si la table profiles existe
      const { data: tablesData, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .eq('tablename', 'profiles');
      
      if (tablesError) {
        console.error('Erreur lors de la vérification de la table profiles:', tablesError);
        toast({
          title: "Erreur",
          description: `Erreur: ${tablesError.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Si la table n'existe pas, on ne peut rien faire
      if (!tablesData || tablesData.length === 0) {
        toast({
          title: "Erreur",
          description: "La table profiles n'existe pas",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Exécuter une requête SQL pour activer RLS sur la table profiles
      const { error: rlsError } = await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'
      });
      
      if (rlsError) {
        console.error('Erreur lors de l\'activation de RLS:', rlsError);
        toast({
          title: "Erreur",
          description: `Impossible d'activer RLS: ${rlsError.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Créer ou remplacer les politiques pour SELECT
      const { error: selectPolicyError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
          ON public.profiles 
          FOR SELECT 
          USING (auth.uid() = id);
        `
      });
      
      if (selectPolicyError) {
        console.error('Erreur lors de la création de la politique SELECT:', selectPolicyError);
        toast({
          title: "Erreur",
          description: `Erreur dans la politique SELECT: ${selectPolicyError.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Créer ou remplacer les politiques pour UPDATE
      const { error: updatePolicyError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id);
        `
      });
      
      if (updatePolicyError) {
        console.error('Erreur lors de la création de la politique UPDATE:', updatePolicyError);
        toast({
          title: "Erreur",
          description: `Erreur dans la politique UPDATE: ${updatePolicyError.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Créer ou remplacer les politiques pour INSERT (tous les utilisateurs peuvent créer leur profil)
      const { error: insertPolicyError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
          ON public.profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
        `
      });
      
      if (insertPolicyError) {
        console.error('Erreur lors de la création de la politique INSERT:', insertPolicyError);
        toast({
          title: "Erreur",
          description: `Erreur dans la politique INSERT: ${insertPolicyError.message}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      toast({
        title: "Succès",
        description: "Politiques RLS vérifiées et mises à jour avec succès",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erreur inattendue lors de la vérification des politiques RLS:', error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la vérification des politiques RLS",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (!mounted || isLoading || !user || !isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuration Supabase</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statut de la connexion</CardTitle>
          <CardDescription>Vérification de la connexion à Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">URL Supabase:</p>
              <p className="text-gray-500">{supabaseUrl}</p>
            </div>
            
            <div>
              <p className="font-medium">Statut:</p>
              <p className={connectionStatus === 'success' ? 'text-green-500' : connectionStatus === 'error' ? 'text-red-500' : 'text-gray-500'}>
                {connectionStatus === 'checking' && 'Vérification...'}
                {connectionStatus === 'success' && 'Connecté avec succès'}
                {connectionStatus === 'error' && 'Erreur de connexion'}
              </p>
              {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {connectionStatus === 'success' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tables de la base de données</CardTitle>
              <CardDescription>Tables disponibles dans votre projet Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              {databaseTables.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {databaseTables.map((table) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucune table trouvée</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Outils de test</CardTitle>
              <CardDescription>Créer des données de test pour votre application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button onClick={createTestUser}>Créer un utilisateur test</Button>
                <p className="text-sm text-gray-500 mt-2">
                  Crée un utilisateur avec un email aléatoire et le mot de passe "password123"
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <Button onClick={verifyAndFixProfilesRLS}>Vérifier/Réparer les politiques RLS</Button>
                <p className="text-sm text-gray-500 mt-2">
                  Vérifie et répare les politiques RLS sur la table profiles pour résoudre les problèmes d'accès
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Note: Ces outils sont destinés au développement uniquement.
              </p>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
} 