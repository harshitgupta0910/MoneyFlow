import { useMemo, useState } from 'react';
import axios from 'axios';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const starterPrompts = [
  'Maine is month kis category me sabse zyada spend kiya?',
  'Kya mujhe kharch kam karna chahiye?',
  'Mere liye 3 saving suggestions do.',
];

const STARTER_PROMPTS_SEEN_KEY = 'finance_assistant_starter_seen';

function toHistory(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-8);
}

export function FinanceAssistantChat({ compact = false }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        'Hi! Main aapka finance assistant hoon. Aap spending, categories, saving, budget ya trend ke baare me kuch bhi puch sakte ho.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStarterPrompts, setShowStarterPrompts] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STARTER_PROMPTS_SEEN_KEY) !== 'true';
  });

  const canSend = useMemo(() => input.trim().length > 1 && !loading, [input, loading]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    if (showStarterPrompts) {
      setShowStarterPrompts(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STARTER_PROMPTS_SEEN_KEY, 'true');
      }
    }

    const nextUser = { id: Date.now(), role: 'user', content };
    const nextMessages = [...messages, nextUser];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/chat/assistant', {
        message: content,
        history: toHistory(nextMessages),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data?.reply || 'Mujhe abhi response generate karne me issue aa raha hai.',
        },
      ]);
    } catch (error) {
      const message = error?.response?.data?.error || 'Chat service temporary unavailable.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: `Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const chatBody = (
    <>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === 'user'
                ? 'ml-8 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm'
                : 'mr-8 rounded-xl bg-muted px-3 py-2 text-sm'
            }
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="mr-8 rounded-xl bg-muted px-3 py-2 text-sm flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {showStarterPrompts && (
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="text-xs px-2 py-1 rounded-md border bg-background hover:bg-muted transition-colors"
              disabled={loading}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Ask about spending, category, savings..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={!canSend} className="primary-gradient text-primary-foreground">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </>
  );

  if (compact) {
    return <div className="space-y-4">{chatBody}</div>;
  }

  return (
    <Card className="shadow-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center gap-2 text-base">
          <Bot className="w-5 h-5 text-primary" />
          Finance AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{chatBody}</CardContent>
    </Card>
  );
}
