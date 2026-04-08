import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMoney } from '@/context/MoneyContext';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getIncomeTotal, getExpenseTotal, accounts, transactions } = useMoney();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = getIncomeTotal('month');
  const monthlyExpense = getExpenseTotal('month');
  const recentTransactions = transactions.slice(0, 3);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Welcome to <span className="text-primary">MoneyFlow</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your income and expenses with ease
          </p>
        </div>

        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-[#156F99] to-[#0E4F6D] text-white overflow-hidden relative">

            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <CardContent className="p-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                    Total Balance
                  </p>
                  <p className="text-4xl md:text-5xl font-display font-bold">
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Transaction Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="primary-gradient text-primary-foreground px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Income / Expense
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">
                    This Month's Income
                  </p>
                  <p className="text-2xl font-display font-bold text-income">
                    {formatCurrency(monthlyIncome)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-income" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">
                    This Month's Expenses
                  </p>
                  <p className="text-2xl font-display font-bold text-expense">
                    {formatCurrency(monthlyExpense)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-expense" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { to: '/dashboard', label: 'Dashboard', icon: '📊' },
            { to: '/transactions', label: 'Transactions', icon: '📝' },
            { to: '/summary', label: 'Summary', icon: '📈' },
            { to: '/accounts', label: 'Accounts', icon: '💳' },
          ].map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl mb-2 block">{link.icon}</span>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {link.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg">Recent Activity</h3>
                  <Link
                    to="/transactions"
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-income" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-expense" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description || tx.category}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${
                          tx.type === 'income' ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
