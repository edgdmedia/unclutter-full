// src/components/layout/Sidebar.jsx
import { cn } from "/lib/utils"
import { Button } from "./../../components/ui/button"
import {
    BookOpenText,
    Calendar,
    SunMedium,
    MessageCircle,
    Users,
    Settings,
    LifeBuoy
} from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

export default function Sidebar({ className }) {
    const location = useLocation()

    const menuItems = [
        { icon: BookOpenText, label: 'Journal', href: '/journal' },
        { icon: SunMedium, label: 'Mood', href: '/mood' },
        { icon: Calendar, label: 'Check-in', href: '/checkin' },
        { icon: MessageCircle, label: 'Chat', href: '/chat', premium: true },
        { icon: Users, label: 'Community', href: '/community', premium: true },
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: LifeBuoy, label: 'Help', href: '/help' },
    ]

    return (
        <div className={cn("pb-12 min-h-screen", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold">Unclutter</h2>
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <Button
                                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                    {item.premium && (
                                        <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                            PRO
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}