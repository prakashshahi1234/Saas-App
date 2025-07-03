'use client';

import { createContext, useContext } from 'react';
import { VerificationRequired } from '@/components/auth/verification-required';
import { useAuthGuard } from '@/hooks/useAuthGuard';

// Create a context that provides the auth guard hook
const AuthContext = createContext<ReturnType<typeof useAuthGuard> | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authGuard = useAuthGuard();

  return (
    <AuthContext.Provider value={authGuard}>
      {children}
    </AuthContext.Provider>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isPublicPage, canAccessProtectedRoute } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Require authentication and email verification for all other pages
  if (!canAccessProtectedRoute) {
    return <VerificationRequired />;
  }

  return <>{children}</>;
} 