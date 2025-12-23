import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Send, MapPin } from 'lucide-react';

export const IncidentForm = () => {
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!desc.trim()) return;

        setLoading(true);
        setSuccess(null);
        try {
            await axios.post('http://localhost:3000/api/incidents', {
                source: 'web-form',
                text: desc
            });
            setSuccess('Incident reported successfully. Help is on the way!');
            setDesc('');
        } catch (err) {
            alert('Failed to report incident. Please call hotline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-red-900/20 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-900/20 blur-3xl rounded-full"></div>
            </div>

            <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl z-10">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                        Emergency Report
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Describe the situation accurately. AI will analyze priority.
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-lg flex items-center gap-3 mb-6">
                        <CheckCircle size={20} />
                        <p className="text-sm">{success}</p>
                        <button onClick={() => setSuccess(null)} className="ml-auto text-xs underline">New Report</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Situation Description</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-32"
                                placeholder="e.g. Fire at 123 Main St, 2 people trapped..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/30'
                                }`}
                        >
                            {loading ? 'Analyzing...' : <><Send size={18} /> Send Report</>}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={10} /> Location Auto-detected</span>
                    <div className="flex gap-4">
                        <a href="/dashboard" className="hover:text-red-400 transition-colors">Admin Access</a>
                        <span>VN-ResQ System v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
