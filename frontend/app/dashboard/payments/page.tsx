'use client';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { createUserBalance, IUserBalance } from '../../../models/UserBalance';
import BalanceDisplay from '../../../components/payments/BalanceDisplay';
import PaymentForm from '../../../components/payments/PaymentForm';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';

const PaymentsPage: React.FC = observer(() => {
  const { user, loading } = useAuthGuard();
  const [userBalance, setUserBalance] = useState<IUserBalance | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (user) {
      const balance = createUserBalance();
      setUserBalance(balance);
      
      // Fetch initial data
      balance.fetchBalance();
      balance.fetchTransactions();
    }
  }, [user]);

  const handleCheckEligibility = async () => {
    if (!userBalance) return;
    
    try {
      const eligibility = await userBalance.checkProjectEligibility();
      
      if (eligibility.canCreateProject) {
        toast.success(`You can create projects! Current balance: ₹${eligibility.currentBalance}`);
      } else {
        toast.error(`Insufficient balance. You need ₹${eligibility.shortfall} more to create a project.`);
      }
    } catch (error) {
      toast.error('Failed to check project eligibility');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userBalance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your payments</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payments & Balance</h1>
        <p className="text-muted-foreground">
          Manage your account balance and payment history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance and Transactions */}
        <div className="space-y-6">
          <BalanceDisplay userBalance={userBalance} />
          
          {/* Project Creation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Creation</CardTitle>
              <CardDescription>
                Each project creation costs ₹100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Project Creation Fee</p>
                    <p className="text-sm text-muted-foreground">
                      Deducted automatically when you create a project
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹100</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckEligibility}
                  disabled={userBalance.isLoading}
                  className="w-full"
                >
                  {userBalance.isLoading ? 'Checking...' : 'Check Project Creation Eligibility'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="space-y-6">
          {!showPaymentForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Add Balance</CardTitle>
                <CardDescription>
                  Top up your account to create more projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full"
                  size="lg"
                >
                  Add Balance
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <PaymentForm userBalance={userBalance} />
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>• Payments are processed securely through Stripe</p>
                <p>• Your balance is updated instantly after successful payment</p>
                <p>• All transactions are recorded in your account history</p>
                <p>• Minimum top-up amount: ₹100</p>
                <p>• Maximum top-up amount: ₹50,000</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your balance will be automatically deducted when you create a new project (₹100 per project).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default PaymentsPage; 