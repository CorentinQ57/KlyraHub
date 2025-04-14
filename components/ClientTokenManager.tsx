"use client"

import { useEffect } from 'react'
import { enforceTokenStorage } from '@/lib/supabase'

export default function ClientTokenManager() {
  useEffect(() => {
    // Ensure token storage is properly enforced on page navigation
    if (typeof window !== 'undefined') {
      try {
        enforceTokenStorage();
      } catch (error) {
        console.error("Error enforcing token storage:", error);
      }
    }

    // Set up periodic token refresh
    const tokenRefreshInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        try {
          enforceTokenStorage();
        } catch (error) {
          console.error("Error in periodic token refresh:", error);
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
} 