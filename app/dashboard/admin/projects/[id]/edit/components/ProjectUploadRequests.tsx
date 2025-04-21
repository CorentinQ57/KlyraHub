'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getUploadRequests, createUploadRequest } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { UploadRequest } from '@/lib/supabase';

type ProjectUploadRequestsProps = {
  project: any
  onRequestsUpdated: () => void
}

export default function ProjectUploadRequests({ project, onRequestsUpdated }: ProjectUploadRequestsProps) {
  const [requests, setRequests] = useState<UploadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, [project.id]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getUploadRequests(project.id);
      setRequests(data);
    } catch (error) {
      console.error('Error loading upload requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes de fichiers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequestName.trim() || !user) {
      return;
    }
    
    setIsCreating(true);
    try {
      const request = await createUploadRequest(
        project.id,
        newRequestName,
        newRequestDescription,
        user.id
      );
      
      if (request) {
        toast({
          title: 'Succès',
          description: 'La demande de fichier a été créée.',
        });
        
        // Refresh the list
        loadRequests();
        
        // Reset form
        setNewRequestName('');
        setNewRequestDescription('');
        
        onRequestsUpdated();
      } else {
        throw new Error('Failed to create upload request');
      }
    } catch (error) {
      console.error('Error creating upload request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de fichier.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50">En attente</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700">Complété</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700">Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de fichiers</CardTitle>
        <CardDescription>
          Créez des espaces où le client pourra déposer des documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-klyra mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement des demandes...</p>
          </div>
        ) : (
          <>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune demande de fichier n'a été créée pour ce projet.</p>
              </div>
            ) : (
              <Table>
                <TableCaption>Liste des demandes de fichiers</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Fichier reçu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          {request.description && (
                            <p className="text-xs text-muted-foreground mt-1">{request.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        {request.file_url ? (
                          <a 
                            href={request.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Voir le fichier
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non reçu</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-medium mb-4">Créer une demande de fichier</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="requestName" className="block text-sm font-medium">
                    Nom de la demande
                  </label>
                  <Input
                    id="requestName"
                    value={newRequestName}
                    onChange={(e) => setNewRequestName(e.target.value)}
                    disabled={isCreating}
                    placeholder="ex: Charte graphique"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="requestDescription" className="block text-sm font-medium">
                    Instructions pour le client
                  </label>
                  <Textarea
                    id="requestDescription"
                    value={newRequestDescription}
                    onChange={(e) => setNewRequestDescription(e.target.value)}
                    disabled={isCreating}
                    placeholder="Expliquez au client ce que vous attendez comme fichier"
                    rows={3}
                  />
                </div>
                
                <Button
                  onClick={handleCreateRequest}
                  disabled={isCreating || !newRequestName.trim()}
                  className="mt-2"
                >
                  {isCreating ? 'Création en cours...' : 'Créer la demande'}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 