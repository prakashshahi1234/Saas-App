'use client';

import { useState } from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            {isSignIn ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>

        {isSignIn ? <SignInForm /> : <SignUpForm />}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => setIsSignIn(!isSignIn)}
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </Button>
          </p>
        </div>


      </div>
    </div>
  );
} 