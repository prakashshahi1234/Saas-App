import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email | Your App',
  description: 'Verify your email address to complete your account setup',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 