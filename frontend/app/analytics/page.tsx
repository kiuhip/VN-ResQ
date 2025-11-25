'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
    { name: 'Mon', alerts: 4 },
    { name: 'Tue', alerts: 7 },
    { name: 'Wed', alerts: 5 },
    { name: 'Thu', alerts: 12 },
    { name: 'Fri', alerts: 9 },
    { name: 'Sat', alerts: 15 },
    { name: 'Sun', alerts: 10 },
];

const typeData = [
    { name: 'SOS Voice', value: 45 },
    { name: 'Vision AI', value: 30 },
    { name: 'Social', value: 25 },
];

const COLORS = ['#ef4444', '#8b5cf6', '#3b82f6'];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">System Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-6">Weekly Alert Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{ fill: '#334155', opacity: 0.4 }}
                                />
                                <Bar dataKey="alerts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alert Distribution */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-6">Alert Distribution by Source</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {typeData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-sm text-slate-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
