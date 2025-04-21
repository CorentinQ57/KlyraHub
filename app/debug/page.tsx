'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function DebugPage() {
  const { user, isAdmin, checkUserRole, session, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [supabaseUserData, setSupabaseUserData] = useState<User | null>(null);
  const [isTypeString, setIsTypeString] = useState<boolean>(false);

  // Vérifier le type de l'utilisateur (détecter le bug)
  useEffect(() => {
    if (user) {
      const userType = typeof user;
      setIsTypeString(userType === 'string');
      
      console.log('Debug: User type check:', {
        type: userType,
        user: user,
        hasId: userType === 'object' && 'id' in (user as any),
        isAdmin,
      });
      
      if (userType === 'object') {
        setDebugInfo({
          user: {
            id: (user as any).id,
            email: (user as any).email,
            isAdmin,
            metadata: (user as any).user_metadata,
            timestamp: new Date().toISOString(),
          },
        });
      } else if (userType === 'string') {
        setDebugInfo({
          userAsString: user,
          isTypeString: true,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      setDebugInfo({
        noUser: true,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user, isAdmin]);

  // Fonction pour vérifier manuellement le rôle de l'utilisateur
  const manualRoleCheck = async () => {
    setLoading(true);
    try {
      if (user && typeof user === 'object' && 'id' in user) {
        const role = await checkUserRole(user.id);
        setUserRole(role);
        setDebugInfo((prev: Record<string, any>) => ({ 
          ...prev, 
          manualRoleCheck: { 
            role, 
            timestamp: new Date().toISOString(), 
          }, 
        }));
      } else {
        setDebugInfo((prev: Record<string, any>) => ({ 
          ...prev, 
          manualRoleCheckError: { 
            error: 'User is not an object or has no ID', 
            timestamp: new Date().toISOString(), 
          }, 
        }));
      }
    } catch (error) {
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        manualRoleCheckError: { 
          error, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'utilisateur directement depuis Supabase
  const getUserFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user from Supabase:', error);
        setDebugInfo((prev: Record<string, any>) => ({ 
          ...prev, 
          supabaseUserError: { 
            error, 
            timestamp: new Date().toISOString(), 
          }, 
        }));
        return;
      }
      
      console.log('Direct Supabase user data:', data.user);
      setSupabaseUserData(data.user);
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        supabaseUser: { 
          user: data.user, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } catch (error) {
      console.error('Exception in getUserFromSupabase:', error);
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        supabaseUserError: { 
          error, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Forcer la récupération de la session
  const forceGetSession = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error forcing session fetch:', error);
        setDebugInfo((prev: Record<string, any>) => ({ 
          ...prev, 
          forceGetSessionError: { 
            error, 
            timestamp: new Date().toISOString(), 
          }, 
        }));
        return;
      }
      
      console.log('Force get session:', {
        session,
        user: session?.user,
        userType: typeof session?.user,
      });
      
      setDebugInfo((prev: Record<string, any>) => ({
        ...prev,
        forceGetSession: {
          session,
          user: session?.user,
          userType: typeof session?.user,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Exception in forceGetSession:', error);
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        forceGetSessionError: { 
          error, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Forcer la déconnexion
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        signOut: { 
          success: true, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } catch (error) {
      console.error('Error signing out:', error);
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        signOutError: { 
          error, 
          timestamp: new Date().toISOString(), 
        }, 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      {isTypeString && (
        <Card className="mb-6 border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Critical Bug Detected</CardTitle>
            <CardDescription>
              The user object is a string instead of an object. This means there was a setUser(string) call somewhere in the code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono p-4 border rounded-md bg-white">
              <p><strong>Current value:</strong> {typeof user === 'string' ? user : 'Not a string'}</p>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Déconnexion...' : 'Déconnexion forcée'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user information and authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-slate-50">
            <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
            <p><strong>User Type:</strong> {typeof user}</p>
            {user && typeof user === 'object' && (
              <>
                <p><strong>User ID:</strong> {(user as any).id}</p>
                <p><strong>User Email:</strong> {(user as any).email}</p>
                <p><strong>Is Admin (from auth context):</strong> {isAdmin ? 'Yes' : 'No'}</p>
                <p><strong>User Metadata:</strong> {JSON.stringify((user as any).user_metadata)}</p>
                <p><strong>Manual Role Check:</strong> {loading ? 'Checking...' : userRole || 'Not checked'}</p>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={manualRoleCheck} disabled={!user || loading || isTypeString}>
              {loading ? 'Checking...' : 'Check User Role Manually'}
            </Button>
            <Button 
              onClick={getUserFromSupabase} 
              disabled={loading}
              variant="outline"
            >
              Get User Directly From Supabase
            </Button>
            <Button 
              onClick={forceGetSession}
              disabled={loading}
              variant="outline"
            >
              Force Get Session
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              disabled={loading}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {supabaseUserData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supabase User (Direct)</CardTitle>
            <CardDescription>User data retrieved directly from Supabase Auth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md bg-slate-50">
              <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto">
                {JSON.stringify(supabaseUserData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
          <CardDescription>Current session data from auth context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-slate-50">
            <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto">
              {session ? JSON.stringify(session, null, 2) : 'No active session'}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Raw data for debugging purposes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-slate-50 font-mono text-sm overflow-auto max-h-[400px]">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 