'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function VerificationRequired() {
  const { user, sendEmailVerification, logout, authLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold">Email Verification Required</CardTitle>
          <CardDescription>
            Please verify your email address to access the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              We sent a verification email to:
            </p>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={sendEmailVerification} 
              className="w-full" 
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => router.push('/verify-email')} 
              variant="outline" 
              className="w-full"
            >
              Check Verification Status
            </Button>

            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 