'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export function SignUpForm() {
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const { signUp, sendEmailVerification, authLoading } = useAuth();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    const normalizedEmail = data.email.toLowerCase().trim();
    try {
      await signUp(normalizedEmail, data.password);
      // Only send verification email if signup was successful
      await sendEmailVerification();
    } catch (error) {
      // If signup fails, don't try to send verification email
      // The error is already handled in the hook
    }
  };


  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Enter your details to create a new account</p>
      </div>

      {isVerificationSent ? (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Verification Email Sent</h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Please check your email and click the verification link to activate your account.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={sendEmailVerification} 
              variant="outline" 
              className="w-full" 
              disabled={authLoading}
            >
              {authLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <Button 
              onClick={() => setIsVerificationSent(false)} 
              variant="ghost" 
              className="w-full"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={authLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a password"
                      {...field}
                      disabled={authLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      {...field}
                      disabled={authLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
} 