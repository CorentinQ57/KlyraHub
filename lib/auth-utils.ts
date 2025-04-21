import { supabase } from './supabase';

// Check user role function
export const checkUserRole = async (userId: string): Promise<string | null> => {
  if (!userId) {
    console.error('checkUserRole called with invalid userId:', userId);
    return null;
  }

  try {
    console.log('Checking user role for:', userId);
    
    // List of known admin emails
    const knownAdminEmails = [
      'corentin@klyra.design',
      'dev@klyra.design',
      'admin@klyra.design',
      'test.admin@example.com',
    ];
    
    // 1. Check localStorage cache
    if (typeof window !== 'undefined') {
      const cachedRole = localStorage.getItem(`user_role_${userId}`);
      if (cachedRole) {
        console.log('Using cached role from localStorage:', cachedRole);
        return cachedRole;
      }
    }
    
    // 2. Fetch from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role from profiles:', error);
      return null;
    }

    // Check if role is defined in the data
    let role = data?.role || null;
    
    // If no role but email is in known admin list
    if (!role && data?.email && knownAdminEmails.includes(data.email.toLowerCase())) {
      console.log('Admin recognized by email from profiles:', data.email);
      role = 'admin';
    }
    
    // Cache the role for future checks
    if (typeof window !== 'undefined' && role) {
      localStorage.setItem(`user_role_${userId}`, role);
    }
    
    return role;
  } catch (dbError) {
    console.error('Error in checkUserRole:', dbError);
    return null;
  }
}; 