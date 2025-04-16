import React from 'react'
import { getCourseBySlug, getCourseModules } from '@/lib/academy-service'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CheckSquare, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { CourseLesson, CourseModule } from '@/lib/academy-service'
import { getResourceById } from '@/lib/academy-service'
import ResourceCard from './ResourceCard'
import { checkUserCourseAccess } from '@/lib/academy-service'
import { ClientTokenManager } from '@/components/ClientTokenManager'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RocketIcon } from '@radix-ui/react-icons'
import { env } from '@/env.mjs'

export default async function CoursePage({
  params,
}: {
  params: { slug: string }
}) {
  // État d'authentification et accès dégradé
  let isAuthenticated = true
  let hasFullAccess = true
  let authError = null
  let course = null
  let modules: CourseModule[] = []
  let resources = null

  try {
    // Récupérer le cours par slug - accessible même sans authentification
    course = await getCourseBySlug(params.slug)
    if (!course) {
      return notFound()
    }

    // On essaie de récupérer les modules du cours, cette partie peut fonctionner même en mode dégradé
    try {
      modules = await getCourseModules(course.id)
    } catch (error) {
      console.error("Erreur lors du chargement des modules:", error)
      // En cas d'erreur, on utilise un tableau vide pour les modules
      modules = []
    }

    // Tentative de vérification d'accès - gestion des erreurs d'authentification
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      const { data: user } = await supabase.auth.getUser()
      
      if (!user.user) {
        isAuthenticated = false
        hasFullAccess = false
        authError = "Non authentifié"
      } else {
        // Vérifier l'accès spécifique au cours
        const accessCheck = await checkUserCourseAccess(user.user.id, course.id)
        hasFullAccess = accessCheck.hasAccess
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error)
      isAuthenticated = false
      hasFullAccess = false
      authError = error instanceof Error ? error.message : "Erreur inconnue"
    }

    // Tentative de récupération des ressources - peut échouer si problème d'authentification
    try {
      if (course.resource_id) {
        resources = await getResourceById(course.resource_id)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ressources:", error)
      resources = null
    }
  } catch (error) {
    console.error("Erreur critique lors du chargement du cours:", error)
    return notFound()
  }

  return (
    <div className="container py-8">
      {/* Afficher un message d'alerte en cas de mode dégradé */}
      {!isAuthenticated && (
        <Alert className="mb-6">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Mode d'accès limité</AlertTitle>
          <AlertDescription>
            Nous rencontrons des difficultés à vérifier votre compte. Certaines fonctionnalités sont limitées.{' '}
            <Link href="/login" className="font-medium underline underline-offset-4">
              Reconnectez-vous
            </Link>{' '}
            pour accéder à toutes les fonctionnalités.
          </AlertDescription>
        </Alert>
      )}

      {course && (
        <>
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          {/* Resources section - affiché même en mode dégradé si disponible */}
          {resources && (
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold">Ressources du cours</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard resource={resources} />
              </div>
            </div>
          )}

          {/* Modules section - affiché avec contenu partiel en mode dégradé */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Modules du cours</h2>
            {modules.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {modules.map((module, index) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <h3 className="font-medium">
                          Module {index + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.length} leçons
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                          >
                            <div className="flex items-center gap-2">
                              {lesson.completed ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <div className="h-5 w-5 rounded-sm border" />
                              )}
                              <Link
                                href={hasFullAccess ? `/academy/${params.slug}/lesson/${lesson.id}` : `/login?redirect=${encodeURIComponent(`/academy/${params.slug}/lesson/${lesson.id}`)}`}
                                className="text-sm font-medium hover:underline"
                              >
                                {lesson.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {lesson.has_quiz && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MessageSquare className="h-4 w-4" />
                                  Quiz
                                </div>
                              )}
                              <div className="text-xs">{lesson.duration} min</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">
                {isAuthenticated
                  ? "Aucun module n'est disponible pour ce cours pour le moment."
                  : "Les modules de ce cours ne peuvent pas être chargés. Veuillez vous connecter pour y accéder."}
              </p>
            )}
          </div>

          {/* Message d'accès restreint si l'utilisateur n'a pas accès complet */}
          {isAuthenticated && !hasFullAccess && (
            <div className="mt-8">
              <Alert>
                <AlertTitle>Accès limité</AlertTitle>
                <AlertDescription>
                  Vous devez acheter ce cours pour accéder à tout son contenu.{' '}
                  <Link href="/pricing" className="font-medium underline underline-offset-4">
                    Voir les options d'abonnement
                  </Link>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      )}
    </div>
  )
} 