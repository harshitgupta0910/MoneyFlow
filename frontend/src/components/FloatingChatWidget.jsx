import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FinanceAssistantChat } from '@/components/FinanceAssistantChat';
import { useAuth } from '@/context/AuthContext';

const PRIVATE_CHAT_ROUTES = ['/app', '/dashboard', '/transactions', '/summary', '/accounts'];

export function FloatingChatWidget() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isPrivateRoute = PRIVATE_CHAT_ROUTES.some((route) => location.pathname.startsWith(route));

  if (loading || !isAuthenticated || !user || !isPrivateRoute) {
    return null;
  }

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
