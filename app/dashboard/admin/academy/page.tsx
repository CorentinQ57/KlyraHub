"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  FileText, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'

export default function AcademyManagementPage() {
  const router = useRouter()
  const { user, isLoading, isAdmin } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link 
          href="/dashboard/admin" 
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Retour à l'administration
        </Link>
        <h1 className="text-3xl font-bold">Gestion de l'Academy</h1>
        <p className="text-muted-foreground mt-2">Administrez le contenu éducatif proposé dans l'academy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/academy/courses">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                Gestion des cours
              </CardTitle>
              <CardDescription>
                Créez, modifiez et supprimez les cours proposés dans l'academy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérez le catalogue de cours, leurs détails et leurs statuts. Chaque cours peut contenir des modules et leçons.
              </p>
            </CardContent>
            <CardFooter className="text-blue-600 flex justify-end items-center text-sm">
              Accéder à la gestion des cours
              <ChevronRight className="ml-1 h-4 w-4" />
            </CardFooter>
          </Card>
        </Link>

        <Link href="/dashboard/admin/academy/resources">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                Gestion des ressources
              </CardTitle>
              <CardDescription>
                Créez, modifiez et supprimez les ressources téléchargeables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérez les eBooks, templates, checklists et vidéos mis à disposition des utilisateurs dans l'academy.
              </p>
            </CardContent>
            <CardFooter className="text-indigo-600 flex justify-end items-center text-sm">
              Accéder à la gestion des ressources
              <ChevronRight className="ml-1 h-4 w-4" />
            </CardFooter>
          </Card>
        </Link>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">Gestion avancée du contenu</h2>
        <p className="text-sm text-blue-700 mb-4">
          Pour gérer les modules et leçons des cours, commencez par accéder à la gestion des cours, 
          puis utilisez l'interface dédiée pour chaque cours spécifique.
        </p>
        <p className="text-sm text-blue-700">
          Les fichiers téléchargeables sont stockés dans le bucket "klyra-academy" de Supabase Storage.
          Les URLs des fichiers sont automatiquement générées lors de l'upload.
        </p>
      </div>
    </div>
  )
} 