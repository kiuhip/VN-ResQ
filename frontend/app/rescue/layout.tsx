import Link from 'next/link';
import { LayoutDashboard, List, Users } from 'lucide-react';

export default function RescueLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <h1 className="text-xl font-bold flex items-center">
                        <span className="text-red-500 mr-2">VN-ResQ</span> Admin
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/rescue/dashboard" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link href="/rescue/incidents" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                        <List className="w-5 h-5 mr-3" />
                        Incidents
                    </Link>
                    <Link href="/rescue/teams" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Rescue Teams
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500">System Status: <span className="text-green-500">Online</span></div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
