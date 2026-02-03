import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Tag, FolderOpen, CreditCard, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useMoney } from '@/context/MoneyContext';
import { cn } from '@/lib/utils';

export function EditTransactionModal({ isOpen, onClose, transaction }) {
  const { categories, divisions, accounts, updateTransaction } = useMoney();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('');
  const [account, setAccount] = useState('');
  const [date, setDate] = useState(dayjs());
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      setCategory(transaction.category);
      setDivision(transaction.division || 'Personal');
      setAccount(transaction.account);
      
      const txDate = new Date(transaction.dateTime);
      setDate(dayjs(txDate));
      
      let hours = txDate.getHours();
      const isPM = hours >= 12;
      setPeriod(isPM ? 'PM' : 'AM');
      
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      
      setHour(hours.toString().padStart(2, '0'));
      setMinute(txDate.getMinutes().toString().padStart(2, '0'));
    }
  }, [transaction]);

  const filteredCategories = categories
    .filter(cat => cat.type === transaction?.type)
    .filter((cat, index, self) => 
      index === self.findIndex(c => c.name === cat.name)
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category || !account) return;

    // Combine date and time
    const combinedDateTime = date.toDate();
    let hours = parseInt(hour);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    combinedDateTime.setHours(hours, parseInt(minute), 0, 0);

    try {
      await updateTransaction(transaction._id, {
        amount: parseFloat(amount),
        description,
        category,
        division: division || 'Personal',
        account,
        dateTime: combinedDateTime,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert(error.response?.data?.error || 'Failed to update transaction');
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-0 sticky top-0 bg-card z-10">
          <DialogTitle className="font-display text-xl">Edit Transaction</DialogTitle>
        </DialogHeader>

        {/* Type Badge */}
        <div className="px-6 pt-4">
          <div className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
            transaction.type === 'income' 
              ? "bg-income/10 text-income" 
              : "bg-expense/10 text-expense"
          )}>
            {transaction.type === 'income' ? 'Income' : 'Expense'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-medium"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={date}
                onChange={(newValue) => setDate(newValue || dayjs())}
                views={['year', 'month', 'day']}
                format="MM/DD/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  },
                  popper: {
                    placement: 'bottom-start'
                  }
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Time
            </Label>
            <div className="flex gap-2">
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = (i + 1).toString().padStart(2, '0');
                    return (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => {
                    const m = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="division" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              Division
            </Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.name}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="account" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Account
            </Label>
            <Select value={account} onValueChange={setAccount} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc._id || acc.id} value={acc.name}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 text-white",
                transaction.type === 'income' ? "bg-income hover:bg-income/90" : "bg-expense hover:bg-expense/90"
              )}
            >
              Update Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
