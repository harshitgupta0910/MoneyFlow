import { useState } from 'react';
import { Mic, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function parseAmount(text) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function inferType(text) {
  const value = text.toLowerCase();
  if (value.includes('income') || value.includes('salary') || value.includes('received')) {
    return 'income';
  }
  return 'expense';
}

export function VoiceExpenseInput({ onParsedExpense }) {
  const [rawText, setRawText] = useState('');

  const handleParse = () => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    const parsed = {
      amount: parseAmount(trimmed),
      description: trimmed,
      type: inferType(trimmed),
      category: '',
      division: 'Personal',
      account: '',
      dateTime: new Date(),
    };

    onParsedExpense(parsed);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3 bg-muted/40 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Quick voice-style input</p>
        <p>Type a sentence like: "Spent 450 on groceries" or "Received 1200 salary".</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice-text" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Expense text
        </Label>
        <Textarea
          id="voice-text"
          rows={4}
          placeholder="Spent 450 on groceries"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount-preview">Detected amount</Label>
        <Input id="amount-preview" value={parseAmount(rawText) || ''} readOnly />
      </div>

      <Button type="button" className="w-full" onClick={handleParse} disabled={!rawText.trim()}>
        <Wand2 className="h-4 w-4 mr-2" />
        Parse Transaction
      </Button>
    </div>
  );
}
