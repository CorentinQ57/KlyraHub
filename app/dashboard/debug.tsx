'use client';

import { useAuth } from '@/lib/auth';

export function DebugAuth() {
  const { user, isAdmin } = useAuth();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold">Debug Info</h3>
      <pre className="mt-2 text-sm">
        {JSON.stringify({
          userId: user?.id,
          email: user?.email,
          isAdmin: isAdmin,
        }, null, 2)}
      </pre>
    </div>
  );
} 