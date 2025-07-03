'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const { user, sendEmailVerification } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!user) {
      router.push('/auth');
      return;
    }

    // If user is already verified, redirect to dashboard
    if (user.emailVerified) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await sendEmailVerification();
      toast.success('Verification email sent successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      toast.error(errorMessage);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleRefreshVerification = async () => {
    setIsVerifying(true);
    try {
      // Reload the user to check if email was verified
      await user?.reload();
      if (user?.emailVerified) {
        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Email not verified yet. Please check your email and click the verification link.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check verification status';
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
          <p className="text-foreground">Email verified successfully! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification email to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <p className="mb-2">
                Please check your email and click the verification link to activate your account.
              </p>
              <p>
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRefreshVerification} 
              className="w-full" 
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'I&apos;ve Verified My Email'
              )}
            </Button>

            <Button 
              onClick={handleResendVerification} 
              variant="outline" 
              className="w-full" 
              disabled={isSendingVerification}
            >
              {isSendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="ghost" 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 