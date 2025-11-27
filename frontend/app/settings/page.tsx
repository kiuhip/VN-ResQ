'use client';

import { Bell, Shield, User, Globe, Moon, Save } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-white">System Settings</h1>

            <div className="grid gap-6">
                {/* General Settings */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Globe className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">General</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-200 font-medium">Language</p>
                                <p className="text-sm text-slate-400">Select system language</p>
                            </div>
                            <select className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                <option>English</option>
                                <option>Vietnamese</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-200 font-medium">Time Zone</p>
                                <p className="text-sm text-slate-400">Set local time zone</p>
                            </div>
                            <select className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                <option>UTC+07:00 Bangkok, Hanoi, Jakarta</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Bell className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                        {['Critical Alerts', 'System Updates', 'New User Registration'].map((item) => (
                            <div key={item} className="flex items-center justify-between">
                                <p className="text-slate-200 font-medium">{item}</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Shield className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-200 font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-slate-400">Add an extra layer of security</p>
                            </div>
                            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Enable</button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
