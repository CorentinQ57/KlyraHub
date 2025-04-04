'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <Link href="/admin" className="text-xl font-bold text-klyra">
            Klyra Admin
          </Link>
        </div>
        <nav className="mt-8 px-4">
          <div className="space-y-4">
            <Link 
              href="/admin" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/projects" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Projets
            </Link>
            <Link 
              href="/admin/services" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Services
            </Link>
            <Link 
              href="/admin/users" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Utilisateurs
            </Link>
            <Link 
              href="/admin/categories" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Catégories
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 