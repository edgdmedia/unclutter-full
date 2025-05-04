
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Settings, 
  FileText, 
  LogOut, 
  BarChart3,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const More: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: <Star className="h-5 w-5 text-amber-500" />,
      label: 'Savings Goals',
      description: 'Track your progress toward financial goals',
      path: '/goals',
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      label: 'Reports',
      description: 'View financial reports and analytics',
      path: '/reports',
    },
    {
      icon: <Tag className="h-5 w-5 text-green-500" />,
      label: 'Categories',
      description: 'Manage your transaction categories',
      path: '/categories',
    },
    {
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      label: 'Settings',
      description: 'Configure app preferences',
      path: '/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">More</h1>
      
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center">
              <div className="mr-4">{item.icon}</div>
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </div>
          </Button>
        ))}
        
        <Button
          variant="ghost"
          className="w-full justify-start p-3 h-auto text-finance-red"
          onClick={handleLogout}
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5 mr-4" />
            <div className="font-medium">Log Out</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default More;
