import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Your App',
  description: 'Sign in or create an account to access the application',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 