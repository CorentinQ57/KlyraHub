'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export default function DebugPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cookies, setCookies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        
        // Get cookies
        const allCookies = document.cookie.split(';').map(c => c.trim());
        setCookies(allCookies);
        
        // Get session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        setUser(data.user);
      } catch (err) {
        console.error('Session error:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSession();
  }, [supabase]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      redirect('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la déconnexion');
    }
  };
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Page de débogage</h1>
      
      {loading ? (
        <p>Chargement des informations de session...</p>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          <p>Erreur: {error}</p>
        </div>
      ) : (
        <>
          <div className="mb-8 p-4 bg-blue-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Session utilisateur</h2>
            {user ? (
              <div>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Dernière connexion:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                <button 
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <p>Aucun utilisateur connecté</p>
            )}
          </div>
          
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Cookies ({cookies.length})</h2>
            {cookies.length > 0 ? (
              <ul className="list-disc pl-5">
                {cookies.map((cookie, index) => (
                  <li key={index} className="mb-1 overflow-x-auto">
                    <code>{cookie}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun cookie trouvé</p>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Navigation</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Accueil
              </a>
              <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Connexion
              </a>
              <a href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Dashboard
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 