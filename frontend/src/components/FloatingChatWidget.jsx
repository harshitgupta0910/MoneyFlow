import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { FinanceAssistantChat } from '@/components/FinanceAssistantChat';

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[100] w-[calc(100vw-2rem)] max-w-[380px]">
          <div className="rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
              <p className="text-sm font-medium">AI Assistant</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-muted"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <FinanceAssistantChat compact />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-[101] h-14 w-14 rounded-full primary-gradient text-primary-foreground shadow-xl hover:scale-105 transition-transform"
        aria-label="Open finance assistant"
      >
        <MessageCircle className="w-6 h-6 mx-auto" />
      </button>
    </>
  );
}
