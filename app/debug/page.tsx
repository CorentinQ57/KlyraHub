"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const { user, isAdmin, checkUserRole } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Function to manually check user role
  const manualRoleCheck = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const role = await checkUserRole(user.id);
        setUserRole(role);
        setDebugInfo((prev: Record<string, any>) => ({ ...prev, manualRoleCheck: { role, timestamp: new Date().toISOString() } }));
      }
    } catch (error) {
      setDebugInfo((prev: Record<string, any>) => ({ ...prev, manualRoleCheckError: { error, timestamp: new Date().toISOString() } }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          isAdmin,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      setDebugInfo({
        noUser: true,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, isAdmin]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user information and authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-slate-50">
            <p><strong>User Authenticated:</strong> {user ? "Yes" : "No"}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>User Email:</strong> {user.email}</p>
                <p><strong>Is Admin (from auth context):</strong> {isAdmin ? "Yes" : "No"}</p>
                <p><strong>Manual Role Check:</strong> {loading ? "Checking..." : userRole || "Not checked"}</p>
              </>
            )}
          </div>
          <div className="mt-4">
            <Button onClick={manualRoleCheck} disabled={!user || loading}>
              {loading ? "Checking..." : "Check User Role Manually"}
            </Button>
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