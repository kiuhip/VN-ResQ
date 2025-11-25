'use client';

import { Bell, Shield, User, Volume2 } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-white">System Settings</h1>

            {/* General Settings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Account Preferences</h3>
                            <p className="text-sm text-slate-400">Manage your account information and role.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                            <input type="text" defaultValue="Admin User" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>Commander</option>
                                <option>Dispatcher</option>
                                <option>Analyst</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Bell className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Notifications & Alerts</h3>
                            <p className="text-sm text-slate-400">Configure how you receive emergency alerts.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: 'Critical Alert Sound', desc: 'Play sound for critical alerts', checked: true },
                        { label: 'Desktop Notifications', desc: 'Show popup for new incidents', checked: true },
                        { label: 'Email Digest', desc: 'Receive daily summary report', checked: false },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Thresholds */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">AI Thresholds</h3>
                            <p className="text-sm text-slate-400">Adjust sensitivity for automated detection.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Vision AI Confidence</label>
                            <span className="text-sm text-slate-400">85%</span>
                        </div>
                        <input type="range" min="0" max="100" defaultValue="85" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Voice Sentiment Sensitivity</label>
                            <span className="text-sm text-slate-400">High</span>
                        </div>
                        <input type="range" min="0" max="100" defaultValue="75" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
