import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMoney } from '@/context/MoneyContext';

export function VoiceTransactionModal({ isOpen, onClose, parsedData }) {
  const { categories, divisions, accounts, addTransaction } = useMoney();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('Personal');
  const [account, setAccount] = useState('');

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (!parsedData) return;

    setAmount(parsedData.amount ? String(parsedData.amount) : '');
    setDescription(parsedData.description || '');
    setType(parsedData.type || 'expense');
    setDivision(parsedData.division || 'Personal');
    setCategory(parsedData.category || '');
    setAccount(parsedData.account || '');
  }, [parsedData]);

  const handleConfirm = async () => {
    if (!amount || !category || !account) return;

    await addTransaction({
      type,
      amount: Number(amount),
      description,
      category,
      division,
      account,
      dateTime: new Date(),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Voice Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => { setType(value); setCategory(''); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat._id || cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id || div._id || div.name} value={div.name}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc._id || acc.id || acc.name} value={acc.name}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Add Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
