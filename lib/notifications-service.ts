import { supabase } from './supabase';

export type NotificationType = 'comment' | 'deliverable' | 'validation' | 'system' | 'project_update';

export interface Notification {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

/**
 * Crée une nouvelle notification
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  projectId?: string
): Promise<Notification | null> {
  try {
    // Insérer la notification dans la base de données
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        project_id: projectId,
        title,
        message,
        type,
        read: false
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erreur lors de la création de la notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur inattendue lors de la création de la notification:', error);
    return null;
  }
}

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur inattendue lors de la récupération des notifications:', error);
    return [];
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur inattendue lors du marquage de la notification comme lue:', error);
    return false;
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur inattendue lors du marquage de toutes les notifications comme lues:', error);
    return false;
  }
}

/**
 * Récupère le nombre de notifications non lues d'un utilisateur
 */
export async function getUnreadNotificationsCount(
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur inattendue lors du comptage des notifications non lues:', error);
    return 0;
  }
}

/**
 * Crée une notification de mise à jour de projet
 */
export async function createProjectUpdateNotification(
  projectId: string,
  title: string,
  message: string
): Promise<boolean> {
  try {
    // 1. Récupérer le client_id du projet
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      console.error('Erreur lors de la récupération du projet:', projectError);
      return false;
    }

    // 2. Créer une notification pour le client
    const notificationResult = await createNotification(
      projectData.client_id,
      title,
      message,
      'project_update',
      projectId
    );

    return !!notificationResult;
  } catch (error) {
    console.error('Erreur inattendue lors de la création de la notification de mise à jour de projet:', error);
    return false;
  }
} 