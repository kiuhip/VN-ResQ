import { Bell, Search } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search incidents, units, or locations..."
                        className="w-full bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5 text-slate-300" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm text-slate-300 font-medium">System Operational</span>
                </div>
            </div>
        </header>
    );
}
