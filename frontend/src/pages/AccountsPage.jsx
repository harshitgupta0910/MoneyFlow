import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Building2, CreditCard, TrendingUp, ArrowRightLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMoney } from '@/context/MoneyContext';
import { cn } from '@/lib/utils';

const accountIcons = {
  'Wallet': <Wallet className="w-6 h-6" />,
  'Building2': <Building2 className="w-6 h-6" />,
  'CreditCard': <CreditCard className="w-6 h-6" />,
  'TrendingUp': <TrendingUp className="w-6 h-6" />,
};

export default function AccountsPage() {
  const { accounts, transferMoney, addAccount } = useMoney();
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('bank');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleTransfer = () => {
    if (!fromAccountId || !toAccountId || !transferAmount || fromAccountId === toAccountId) return;
    
    transferMoney({
      fromAccountId,
      toAccountId,
      amount: parseFloat(transferAmount),
    });

    setFromAccountId('');
    setToAccountId('');
    setTransferAmount('');
    setIsTransferModalOpen(false);
  };

  const handleAddAccount = () => {
    if (!newAccountName) return;
    
    const iconMap = {
      cash: 'Wallet',
      bank: 'Building2',
      credit: 'CreditCard',
      investment: 'TrendingUp',
    };

    const colorMap = {
      cash: 'hsl(45, 90%, 50%)',
      bank: 'hsl(200, 75%, 50%)',
      credit: 'hsl(0, 72%, 55%)',
      investment: 'hsl(152, 70%, 40%)',
    };

    addAccount({
      name: newAccountName,
      type: newAccountType,
      balance: parseFloat(newAccountBalance) || 0,
      icon: iconMap[newAccountType],
      color: colorMap[newAccountType],
    });

    setNewAccountName('');
    setNewAccountType('bank');
    setNewAccountBalance('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your accounts and transfers</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="primary-gradient text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
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
                <p className="text-primary-foreground/70 text-sm mt-2">
                  Across {accounts.length} accounts
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: account.color + '20' }}
                  >
                    <div style={{ color: account.color }}>
                      {accountIcons[account.icon] || <Wallet className="w-6 h-6" />}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {account.type}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
                <p
                  className={cn(
                    "text-2xl font-display font-bold",
                    account.balance >= 0 ? 'text-income' : 'text-expense'
                  )}
                >
                  {formatCurrency(account.balance)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Account Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <div style={{ color: account.color }}>
                        {accountIcons[account.icon] || <Wallet className="w-5 h-5" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        account.balance >= 0 ? 'text-income' : 'text-expense'
                      )}
                    >
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((account.balance / totalBalance) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Transfer Money
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc._id} value={acc._id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((acc) => acc._id !== fromAccountId)
                    .map((acc) => (
                      <SelectItem key={acc._id} value={acc._id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} className="primary-gradient text-primary-foreground">
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g., Savings Account"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={newAccountType} onValueChange={(v) => setNewAccountType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Balance</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAccount} className="primary-gradient text-primary-foreground">
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
