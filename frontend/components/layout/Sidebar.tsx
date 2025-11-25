import Link from 'next/link';
import { LayoutDashboard, Map, Radio, Settings, Activity } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Live Map', href: '/map', icon: Map },
    { name: 'Alerts', href: '/alerts', icon: Radio },
    { name: 'Analytics', href: '/analytics', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    return (
        <div className="flex flex-col w-64 h-screen bg-slate-900 border-r border-slate-800 text-white">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    VN-RESQ
                </h1>
                <p className="text-xs text-slate-400 mt-1">Intelligent Command Center</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group",
                            "hover:bg-slate-800 hover:text-blue-400",
                            "text-slate-300"
                        )}
                    >
                        <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium">Admin User</p>
                        <p className="text-xs text-slate-400">Commander</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
