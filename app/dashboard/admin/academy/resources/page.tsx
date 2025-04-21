'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileEdit, 
  Trash2, 
  PlusCircle, 
  Download, 
  BookOpen, 
  Video,
  FileText,
  CheckCircle,
  ChevronLeft, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { Resource, getCategories, getResources } from '@/lib/academy-service';
import { supabase } from '@/lib/supabase';

export default function ResourcesManagementPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    type: 'eBook' as 'eBook' | 'Vidéo' | 'Template' | 'Checklist',
    download_link: '',
    is_popular: false,
    is_new: false,
    image: null as File | null,
  });
  
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (user && isAdmin) {
      loadData();
    }
  }, [user, authLoading, isAdmin, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les ressources
      const resourcesData = await getResources();
      setResources(resourcesData);
      
      // Charger les catégories pour le formulaire
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
    case 'eBook':
      return <BookOpen className="h-5 w-5 text-purple-500" />;
    case 'Vidéo':
      return <Video className="h-5 w-5 text-red-500" />;
    case 'Template':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'Checklist':
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
    case 'eBook':
      return 'bg-purple-500';
    case 'Vidéo':
      return 'bg-red-500';
    case 'Template':
      return 'bg-green-500';
    case 'Checklist':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingResource?.image_url;

      // Upload new image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('klyra-academy')
          .upload(filePath, formData.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('klyra-academy')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const resourceData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        type: formData.type,
        download_link: formData.download_link || null,
        image_url: imageUrl,
        is_popular: formData.is_popular,
        is_new: formData.is_new,
        updated_at: new Date().toISOString(),
      };

      if (editingResource) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', editingResource.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new resource
        const { error } = await supabase
          .from('resources')
          .insert({
            ...resourceData,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Succès',
        description: `Ressource ${editingResource ? 'modifiée' : 'créée'} avec succès.`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la ressource.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Succès',
        description: 'Ressource supprimée avec succès.',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la ressource.',
        variant: 'destructive',
      });
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category_id: resource.category_id,
      type: resource.type as 'eBook' | 'Vidéo' | 'Template' | 'Checklist',
      download_link: resource.download_link || '',
      is_popular: resource.is_popular,
      is_new: resource.is_new,
      image: null,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      category_id: '',
      type: 'eBook',
      download_link: '',
      is_popular: false,
      is_new: false,
      image: null,
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <Link 
            href="/dashboard/admin/academy" 
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour à la gestion de l'academy
          </Link>
          <h1 className="text-3xl font-bold">Gestion des ressources</h1>
          <p className="text-muted-foreground">Gérez les ressources disponibles dans l'academy.</p>
        </div>
        <Button onClick={handleOpenDialog} className="mt-4 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une ressource
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <Table>
            <TableCaption>Liste des ressources de l'academy</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Lien</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p>Aucune ressource trouvée</p>
                    <Button variant="link" onClick={handleOpenDialog} className="mt-2">
                      Ajouter votre première ressource
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      {resource.image_url ? (
                        <div className="relative h-10 w-12 rounded overflow-hidden bg-gray-100">
                          <Image 
                            src={resource.image_url} 
                            alt={resource.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-12 bg-gray-100 rounded flex items-center justify-center">
                          {getResourceTypeIcon(resource.type)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{resource.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getResourceTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.category}</TableCell>
                    <TableCell>
                      {resource.download_link ? (
                        <a 
                          href={resource.download_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </a>
                      ) : (
                        <span className="text-gray-400">Non disponible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {resource.is_new && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Nouveau
                          </Badge>
                        )}
                        {resource.is_popular && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Populaire
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditResource(resource)}
                      >
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Modifier la ressource' : 'Ajouter une nouvelle ressource'}
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour {editingResource ? 'modifier' : 'ajouter'} une ressource.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'eBook' | 'Vidéo' | 'Template' | 'Checklist') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eBook">eBook</SelectItem>
                    <SelectItem value="Vidéo">Vidéo</SelectItem>
                    <SelectItem value="Template">Template</SelectItem>
                    <SelectItem value="Checklist">Checklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="download_link">Lien de téléchargement</Label>
                <Input
                  id="download_link"
                  value={formData.download_link}
                  onChange={(e) => setFormData({ ...formData, download_link: e.target.value })}
                  placeholder="https://exemple.com/ressource.pdf"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image de la ressource</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {editingResource?.image_url && !formData.image && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="relative h-10 w-16 rounded overflow-hidden">
                      <Image 
                        src={editingResource.image_url} 
                        alt="Image actuelle" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Image actuelle</span>
                  </div>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label htmlFor="is-popular">Marquer comme populaire</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                />
                <Label htmlFor="is-new">Marquer comme nouveau</Label>
              </div>
            </div>

            <DialogFooter className="flex space-x-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingResource ? 'Mettre à jour' : 'Créer la ressource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 