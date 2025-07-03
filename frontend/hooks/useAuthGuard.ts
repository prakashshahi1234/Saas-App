'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export function useAuthGuard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Define auth pages that don't require authentication
  const isAuthPage = pathname === '/auth' || pathname === '/verify-email';
  const isPublicPage = isAuthPage ;
  const isEmailVerified = user?.emailVerified || false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicPage) {
        // Redirect to auth page if not authenticated and not on a public page
        router.push('/auth');
      } else if (user && !isEmailVerified && !isAuthPage) {
        // Redirect to verify-email page if authenticated but not verified
        router.push('/verify-email');
      } else if (user && isEmailVerified && isAuthPage) {
        // Redirect to dashboard if authenticated, verified, and on auth page
        router.push('/dashboard');
      }
    }
  }, [user, loading, isEmailVerified, router, pathname, isPublicPage, isAuthPage]);

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      // Normalize email to lowercase to prevent case-sensitivity issues
      const normalizedEmail = email.toLowerCase().trim();
      
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else {
        errorMessage = error.message || 'Failed to sign in';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      // Normalize email to lowercase to prevent case-sensitivity issues
      const normalizedEmail = email.toLowerCase().trim();
      
      await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else {
        errorMessage = error.message || 'Failed to create account';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const sendEmailVerification = async () => {
    setAuthLoading(true);
    try {
      if (!auth.currentUser) {
        const errorMessage = 'No user is currently signed in';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      await firebaseSendEmailVerification(auth.currentUser);
      toast.success('Verification email sent successfully!');
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error.message || 'Failed to send verification email';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent successfully!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else {
        errorMessage = error.message || 'Failed to send password reset email';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    // State
    user,
    loading,
    authLoading,
    isEmailVerified,
    
    // Route protection
    isAuthPage,
    isPublicPage,
    isAuthenticated: !!user,
    isVerified: isEmailVerified,
    canAccessProtectedRoute: !!user && isEmailVerified,
    
    // Auth functions
    signIn,
    signUp,
    logout,
    sendEmailVerification,
    sendPasswordReset,
  };
} 