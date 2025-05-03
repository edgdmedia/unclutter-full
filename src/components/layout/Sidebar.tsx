
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, ArrowDownUp, ChartPie, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Accounts', path: '/accounts' },
  { icon: ArrowDownUp, label: 'Transactions', path: '/transactions' },
  { icon: ChartPie, label: 'Budgets', path: '/budgets' },
  { icon: Star, label: 'Goals', path: '/goals' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-[calc(100vh-64px)] flex-shrink-0">
      <div className="py-6">
        <div className="px-4 mb-6">
          <div className="text-sm font-medium text-sidebar-foreground/70">
            Navigation
          </div>
        </div>
        
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:bg-opacity-50"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
