'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { observer } from 'mobx-react-lite';
import { IUserBalance } from '../../models/UserBalance';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RUpeJIrxZd9F7IbymqMr72k545w9oCqZgmabX2eCriAvRj29eHlIpr7o1BGucVt7ub4L6ZISykb7DMJpfrxXewG002qG09aJ0');

interface PaymentFormProps {
  userBalance: IUserBalance;
}

const CheckoutForm: React.FC<{ userBalance: IUserBalance; amount: number; onSuccess: () => void }> = observer(({ userBalance, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const { clientSecret } = await userBalance.createPaymentIntent(amount);

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful! Updating your balance...');
        
        // Direct payment confirmation - update balance immediately
        try {
          await userBalance.manualBalanceUpdate(amount, paymentIntent.id);
          toast.success('Balance updated successfully!');
        } catch (error: any) {
          console.warn('Direct update failed, trying refresh:', error);
          // Fallback to refresh
          await userBalance.refreshAfterPayment();
        }
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing || userBalance.isLoading}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
      </Button>
    </form>
  );
});

const PaymentForm: React.FC<PaymentFormProps> = observer(({ userBalance }) => {
  const [amount, setAmount] = useState<number>(500);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const predefinedAmounts = [100, 500, 1000, 2000, 5000];

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setAmount(value);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setAmount(500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Balance</CardTitle>
        <CardDescription>
          Top up your account balance to create projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Amount</label>
          <div className="grid grid-cols-3 gap-2">
            {predefinedAmounts.map((predefinedAmount) => (
              <Button
                key={predefinedAmount}
                variant={amount === predefinedAmount ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAmountSelect(predefinedAmount)}
              >
                ₹{predefinedAmount}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Amount</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount || ''}
            onChange={handleCustomAmountChange}
            min="1"
            max="50000"
          />
        </div>

        {!showPaymentForm ? (
          <Button
            onClick={() => setShowPaymentForm(true)}
            disabled={amount < 1}
            className="w-full"
          >
            Proceed to Payment
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You are about to pay ₹{amount}
              </p>
            </div>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                userBalance={userBalance}
                amount={amount}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <Button
              variant="outline"
              onClick={() => setShowPaymentForm(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default PaymentForm; 