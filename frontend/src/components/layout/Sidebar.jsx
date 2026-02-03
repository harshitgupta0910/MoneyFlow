import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Wallet, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/summary', icon: PieChart, label: 'Summary' },
  { path: '/accounts', icon: Wallet, label: 'Accounts' },
];

export function Sidebar({ onAddTransaction, onCollapse }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">
                MoneyFlow
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center mx-auto">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Add Transaction Button */}
      <div className="p-4">
        <Button
          onClick={onAddTransaction}
          className={cn(
            "w-full primary-gradient text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all duration-200",
            collapsed ? "px-0" : "px-4"
          )}
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Add Transaction</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4 text-sidebar-foreground/70" />
              <div className="flex-1 truncate">
                <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
