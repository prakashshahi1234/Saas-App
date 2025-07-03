'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { IUserBalance } from '../../models/UserBalance';
import { formatDistanceToNow } from 'date-fns';

interface BalanceDisplayProps {
  userBalance: IUserBalance;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = observer(({ userBalance }) => {
  const getTransactionTypeColor = (type: string) => {
    return type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? '+' : '-';
  };

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Account Balance</span>
            <span className="text-2xl font-bold text-green-600">
              {userBalance.formattedBalance}
            </span>
          </CardTitle>
          <CardDescription>
            Available balance for project creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Credits</p>
              <p className="font-semibold text-green-600">
                ₹{userBalance.totalCredits.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Debits</p>
              <p className="font-semibold text-red-600">
                ₹{userBalance.totalDebits.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userBalance.isLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : userBalance.recentTransactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userBalance.recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getTransactionTypeColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {getTransactionIcon(transaction.type)}₹{transaction.amount.toFixed(2)}
                    </p>
                    <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default BalanceDisplay; 