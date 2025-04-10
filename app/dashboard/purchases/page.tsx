"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'

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

  return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Historique d'achats</h1>
            <p className="text-muted-foreground">
              Retrouvez l'ensemble de vos achats et factures Klyra
            </p>
          </div>
          
          {/* Liste des achats */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : (
              <>
                {purchases.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted border-b">
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-muted/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(purchase.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {purchase.service_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
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
                                    Facture
                                  </Button>
                                )}
                                {purchase.project_id && (
                                  <Link href={`/dashboard/projects/${purchase.project_id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      Voir le projet
                                    </Button>
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium">Aucun achat</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Vous n'avez pas encore effectué d'achat sur Klyra
                      </p>
                      <Link href="/dashboard/marketplace">
                    <Button>
                          Explorer les services
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          
          {/* Informations supplémentaires */}
          {purchases.length > 0 && (
            <div className="mt-8 border rounded-lg p-6 bg-muted/20">
              <h3 className="text-lg font-medium mb-2">Besoin d'aide avec votre commande ?</h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe est à votre disposition pour toute question relative à vos achats.
              </p>
              <Link href="/contact">
                <Button variant="outline">
                  Contacter le support
                </Button>
              </Link>
            </div>
          )}
    </div>
  )
} 