'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteCard } from '@/components/ui/quote-card';
import { LogOut, User, Mail, CheckCircle, BarChart3, FolderOpen, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ProjectsPage from './projects/page';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Your Project Efficiently</h1>
      <p className="text-muted-foreground mb-8">
        Create, track, and manage your projects with powerful tools and real-time insights. Monitor progress, set priorities, and collaborate with your team efficiently.
      </p>
      
      {/* Quote Card - Full Width */}
      <div className="mb-6">
        <QuoteCard />
      </div>
      
      {/* Projects Section */}
      <div className="mb-6">
        <ProjectsPage />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/payments">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments & Balance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account status and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Created</span>
                <span className="text-sm text-gray-600">
                  {user?.metadata.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Sign In</span>
                <span className="text-sm text-gray-600">
                  {user?.metadata.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 