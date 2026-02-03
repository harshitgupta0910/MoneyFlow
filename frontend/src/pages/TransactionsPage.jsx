import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Edit2, Trash2, X, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useMoney } from '@/context/MoneyContext';
import { cn } from '@/lib/utils';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TransactionsPage() {
  const { transactions, categories, divisions, accounts, canEditTransaction, deleteTransaction } = useMoney();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          tx.description?.toLowerCase() || '',
          tx.category?.toLowerCase() || '',
          tx.account?.toLowerCase() || '',
          tx.fromAccount?.toLowerCase() || '',
          tx.toAccount?.toLowerCase() || ''
        ];
        
        if (!searchFields.some(field => field.includes(query))) {
          return false;
        }
      }

      // Category filter (skip for transfers)
      if (filters.category && tx.type !== 'transfer' && tx.category !== filters.category) return false;

      // Division filter (skip for transfers)
      if (filters.division && tx.type !== 'transfer' && tx.division !== filters.division) return false;

      // Type filter
      if (filters.type && tx.type !== filters.type) return false;

      // Account filter
      if (filters.account && tx.account !== filters.account) return false;

      // Date range filter
      if (startDate && tx.dateTime < startDate.toDate()) return false;
      if (endDate) {
        const endOfDay = endDate.toDate();
        endOfDay.setHours(23, 59, 59, 999);
        if (tx.dateTime > endOfDay) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filters, startDate, endDate]);

  const clearFilters = () => {
    setFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || startDate || endDate || searchQuery;

  const uniqueCategories = [...new Set(categories.map(c => c.name))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage all your transactions</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary text-primary-foreground")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                Active
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select
                      value={filters.type || 'all'}
                      onValueChange={(v) => {
                        const newFilters = { ...filters };
                        if (v && v !== 'all') {
                          newFilters.type = v;
                        } else {
                          delete newFilters.type;
                        }
                        setFilters(newFilters);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={filters.category || 'all'}
                      onValueChange={(v) => {
                        const newFilters = { ...filters };
                        if (v && v !== 'all') {
                          newFilters.category = v;
                        } else {
                          delete newFilters.category;
                        }
                        setFilters(newFilters);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {uniqueCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Division</label>
                    <Select
                      value={filters.division || 'all'}
                      onValueChange={(v) => {
                        const newFilters = { ...filters };
                        if (v && v !== 'all') {
                          newFilters.division = v;
                        } else {
                          delete newFilters.division;
                        }
                        setFilters(newFilters);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All divisions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All divisions</SelectItem>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.name}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">End Date</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="font-display flex items-center justify-between">
              <span>Transaction History</span>
              <Badge variant="secondary">{filteredTransactions.length} transactions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category / Transfer</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              tx.type === 'income' ? 'bg-income/10' : 
                              tx.type === 'expense' ? 'bg-expense/10' : 
                              'bg-blue-500/10'
                            )}
                          >
                            {tx.type === 'income' ? (
                              <TrendingUp className="w-4 h-4 text-income" />
                            ) : tx.type === 'expense' ? (
                              <TrendingDown className="w-4 h-4 text-expense" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tx.description || '-'}</TableCell>
                        <TableCell>
                          {tx.type === 'transfer' ? (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">{tx.fromAccount}</span>
                              <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                              <span className="text-muted-foreground">{tx.toAccount}</span>
                            </div>
                          ) : (
                            <Badge variant="outline">{tx.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.division || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.account}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {dayjs(tx.dateTime).format('MMM D, YYYY HH:mm')}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-semibold",
                          tx.type === 'income' ? 'text-income' : 
                          tx.type === 'expense' ? 'text-expense' : 
                          'text-blue-500'
                        )}>
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {tx.type !== 'transfer' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!canEditTransaction(tx)}
                                title={!canEditTransaction(tx) ? 'Cannot edit transactions older than 12 hours' : 'Edit'}
                                onClick={() => {
                                  setEditingTransaction(tx);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-expense hover:text-expense">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this transaction? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTransaction(tx._id)}
                                    className="bg-expense hover:bg-expense/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />
    </div>
  );
}
