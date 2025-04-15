import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook to provide access to the Supabase client instance
 * @returns An object containing the supabase client
 */
export function useSupabase() {
  // Return the Supabase client instance
  return { supabase };
} 