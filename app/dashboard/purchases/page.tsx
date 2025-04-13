"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { PageContainer, PageHeader, PageSection, ContentCard } from '@/components/ui/page-container'
import { ShoppingBag, Download, ExternalLink } from 'lucide-react'

type Purchase = {
  id: string
  service_name: string
  price: number
  date: string
  status: 'completed' | 'processing' | 'refunded'
  invoice_url?: string
  project_id?: number
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadPurchases()
    }
  }, [user])

  const loadPurchases = async () => {
    setIsLoading(true)
    try {
      // Cette fonction serait remplacée par un appel à Supabase dans une implémentation réelle
      // Simulation de chargement des achats
      setTimeout(() => {
        const mockPurchases: Purchase[] = [
          {
            id: '1',
            service_name: 'Landing Page',
            price: 1490,
            date: '2024-03-15',
            status: 'completed',
            invoice_url: '#',
            project_id: 1
          },
          {
            id: '2',
            service_name: 'Branding Complet',
            price: 2490,
            date: '2024-02-28',
            status: 'completed',
            invoice_url: '#',
            project_id: 2
          },
          {
            id: '3',
            service_name: 'Audit UX/UI',
            price: 990,
            date: '2024-01-10',
            status: 'completed',
            invoice_url: '#',
            project_id: 3
          }
        ]
        setPurchases(mockPurchases)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos achats",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Fonction pour formater les prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé'
      case 'processing':
        return 'En cours'
      case 'refunded':
        return 'Remboursé'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement des données d'achat...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Historique d'achats"
        description="Retrouvez l'ensemble de vos achats et factures Klyra"
      >
        <Link href="/dashboard/marketplace">
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" /> Explorer les services
          </Button>
        </Link>
      </PageHeader>
      
      <PageSection>
        {purchases.length > 0 ? (
          <ContentCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-6 py-4 whitespace-nowrap text-[14px]">
                        {new Date(purchase.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px]">
                        {purchase.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-medium">
                        {formatPrice(purchase.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {getStatusLabel(purchase.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        {purchase.invoice_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(purchase.invoice_url, '_blank')}
                          >
                            <Download className="mr-1 h-3 w-3" /> Facture
                          </Button>
                        )}
                        {purchase.project_id && (
                          <Link href={`/dashboard/projects/${purchase.project_id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" /> Voir le projet
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentCard>
        ) : (
          <ContentCard className="py-8 text-center">
            <h3 className="text-[18px] font-semibold mb-2">Aucun achat</h3>
            <p className="text-[14px] text-[#64748B] mb-6">
              Vous n'avez pas encore effectué d'achat sur Klyra
            </p>
            <Link href="/dashboard/marketplace">
              <Button>
                Explorer les services
              </Button>
            </Link>
          </ContentCard>
        )}
      </PageSection>
      
      {purchases.length > 0 && (
        <PageSection>
          <ContentCard>
            <h3 className="text-[18px] font-semibold mb-2">Besoin d'aide avec votre commande ?</h3>
            <p className="text-[14px] text-[#64748B] mb-4">
              Notre équipe est à votre disposition pour toute question relative à vos achats.
            </p>
            <Link href="/contact">
              <Button variant="outline">
                Contacter le support
              </Button>
            </Link>
          </ContentCard>
        </PageSection>
      )}
    </PageContainer>
  )
} 