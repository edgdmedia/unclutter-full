// src/components/layout/Header.jsx
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Bell } from 'lucide-react'

export default function Header({ onMenuClick }) {
    const [notifications] = useState([])

    return (
        <header className="border-b">
            <div className="flex h-16 items-center px-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="ml-auto flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-6 w-6" />
                        {notifications.length > 0 && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                                {notifications.length}
                            </div>
                        )}
                    </Button>
                    <Avatar>
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}

