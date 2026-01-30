'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    if (!user) return null; // Or loading spinner

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800">FUTKIDS</h1>
                    <p className="text-xs text-gray-500 mt-1">Academy Panel</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                        Dashboard
                    </Link>
                    <Link href="/dashboard/players" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                        Players
                    </Link>
                    <Link href="/dashboard/parents" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                        Parents
                    </Link>
                    <Link href="/dashboard/stats" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                        Stats Entry
                    </Link>
                    <Link href="/dashboard/settings" className="block px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
                        Settings
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {user.fullName?.[0]}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full mt-4 justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
