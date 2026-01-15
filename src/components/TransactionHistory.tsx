'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatETH } from '@/lib/numbers';
import { formatRelativeTime } from '@/lib/date';

interface Transaction {
  hash: string;
  type: 'collect' | 'transfer' | 'approval';
  vaultId?: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  value?: bigint;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const vaultNames = ['🔴 Ruby', '🟢 Emerald', '🔵 Sapphire'];

const typeLabels: Record<Transaction['type'], string> = {
  collect: 'Seal Collected',
  transfer: 'Transfer',
  approval: 'Approval',
};

const statusColors: Record<Transaction['status'], string> = {
  pending: 'warning',
  confirmed: 'success',
  failed: 'error',
};

export function TransactionList({
  transactions,
  isLoading = false,
  emptyMessage = 'No transactions yet',
  className = '',
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {transactions.map((tx) => (
        <TransactionItem key={tx.hash} transaction={tx} />
      ))}
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const truncatedHash = `${transaction.hash.slice(0, 6)}...${transaction.hash.slice(-4)}`;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          {transaction.type === 'collect' ? '🦭' : '📤'}
        </div>
        <div>
          <div className="font-medium text-white">
            {typeLabels[transaction.type]}
            {transaction.vaultId !== undefined && (
              <span className="ml-2 text-gray-400">
                {vaultNames[transaction.vaultId]}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            <a
              href={`https://basescan.org/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              {truncatedHash}
            </a>
            <span className="mx-2">•</span>
            {formatRelativeTime(transaction.timestamp)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {transaction.value && (
          <span className="text-gray-400 text-sm">
            {formatETH(transaction.value)} ETH
          </span>
        )}
        <Badge variant={statusColors[transaction.status] as 'success' | 'warning' | 'error'}>
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}

interface TransactionHistoryProps {
  address?: string;
  limit?: number;
}

export function TransactionHistory({ address, limit = 10 }: TransactionHistoryProps) {
  // In a real app, this would fetch from an API or indexer
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setTransactions([]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [address, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          emptyMessage="No transactions found"
        />
      </CardContent>
    </Card>
  );
}
