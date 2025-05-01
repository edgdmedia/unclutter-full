import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, BookOpen, Calendar, Home, Moon, Users } from 'lucide-react';
import { authService } from '../../services/auth';

const AppShell = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = location.pathname.split('/')[1] || 'home';
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
    };

    const navigation = [
        { name: 'Home', icon: Home, route: '/' },
        { name: 'Journal', icon: BookOpen, route: '/journal' },
        { name: 'Mood', icon: Moon, route: '/mood' },
        { name: 'Check-in', icon: Calendar, route: '/checkin' },
        { name: 'Emergency', icon: AlertCircle, route: '/emergency', className: 'text-red-600' },
    ];

    const comingSoonFeatures = [
        { name: 'Resources', icon: BookOpen },
        { name: 'Community', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-[#764330]">Unclutter</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    className="p-2 rounded-full hover:bg-gray-100"
                                    onClick={() => {
                                        // Add dropdown toggle logic here
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#FFDC5E] flex items-center justify-center">
                                        <span className="text-[#441913] font-medium">
                                            {user?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                </button>
                                {/* Add dropdown menu here */}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-around">
                        {navigation.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.route)}
                                className={`flex flex-col items-center py-3 px-2 ${(item.route === '/' ? currentPage === '' : item.route.slice(1) === currentPage)
                                    ? 'text-[#764330]'
                                    : 'text-gray-500'
                                    } ${item.className || ''}`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="text-xs mt-1">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Coming Soon Features Overlay */}
            <div className="fixed right-4 bottom-20 bg-white rounded-lg shadow-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Coming Soon</div>
                {comingSoonFeatures.map((feature) => (
                    <div
                        key={feature.name}
                        className="flex items-center space-x-2 text-gray-400 py-2"
                    >
                        <feature.icon className="h-5 w-5" />
                        <span className="text-sm">{feature.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppShell;