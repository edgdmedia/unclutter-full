
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, ArrowDownUp, ChartPie, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Accounts', path: '/accounts' },
  { icon: ArrowDownUp, label: 'Transactions', path: '/transactions' },
  { icon: ChartPie, label: 'Budgets', path: '/budgets' },
  { icon: Menu, label: 'More', path: '/more' },
];

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full",
              isActive ? "text-finance-yellow" : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
