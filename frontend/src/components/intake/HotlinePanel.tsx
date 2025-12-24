import { Phone, Mic, Edit3, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const HotlinePanel = () => {
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const handleTranscribe = async () => {
        if (!audioFile) return;
        setLoading(true);
        setStatus('idle');
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            const res = await axios.post('http://localhost:3000/api/hotline/transcribe-audio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Populate the text area with the transcript
            if (res.data.transcription) {
                 setDetails(prev => (prev ? prev + '\n\n' : '') + `[Transcript]: ${res.data.transcription}`);
            }
            // We could also use other extraction data if we had fields for it, 
            // but simply putting it in the text area allows the operator to review/edit.
            
            setAudioFile(null); // Clear file after transcription
        } catch (error) {
            alert('Transcription failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.trim()) return;

        setLoading(true);
        setStatus('idle');
        try {
            // Manual Text Mode (or Post-Transcription Mode)
            await axios.post('http://localhost:3000/api/incidents', {
                source: 'hotline',
                text: details
            });
           
            setStatus('success');
            setDetails('');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Status Header */}
             <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Phone size={18} className="text-red-400" />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse border border-gray-900"></span>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-red-100 uppercase tracking-wide">Line Active</h3>
                        <p className="text-[10px] text-red-300">Operator: #OP-2024</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-white">00:42</p>
                    <p className="text-[10px] text-gray-400">Call Duration</p>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1"><Edit3 size={12} /> Call Logs / Transcript / Audio</span>
                        
                        {/* Audio Upload Control */}
                        <div className="flex items-center gap-2">
                             {audioFile ? (
                                <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                    <span className="text-[10px] text-green-400 max-w-[100px] truncate">{audioFile.name}</span>
                                    <button onClick={() => setAudioFile(null)} type="button" className="text-red-400 hover:text-red-300">×</button>
                                </div>
                             ) : (
                                <label className="cursor-pointer text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                    <Mic size={10} /> Upload Audio
                                    <input 
                                        type="file" 
                                        accept="audio/*" 
                                        className="hidden" 
                                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                             )}

                             {/* Transcribe Button - Only shows if file is present */}
                             {audioFile && (
                                 <button 
                                    type="button" 
                                    onClick={handleTranscribe}
                                    disabled={loading}
                                    className="text-[10px] bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded font-bold animate-in fade-in"
                                 >
                                    {loading ? '...' : 'Transcribe to Text'}
                                 </button>
                             )}
                        </div>
                    </label>
                    <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full h-32 bg-black/30 border border-gray-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none font-mono"
                        placeholder="Typing operator notes, OR upload audio and click 'Transcribe' to fill this automatically..."
                    />
                </div>

                <div className="flex gap-2">
                     <button 
                        type="button"
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-bold text-gray-400 transition-colors"
                    >
                        Hold Call
                    </button>
                    <button 
                        type="submit"
                        disabled={loading || !details.trim()}
                        className="flex-[2] py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {loading ? 'Processing...' : <><Send size={14} /> Create Incident Report</>}
                    </button>
                </div>
                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-400 text-xs justify-center bg-green-900/20 p-2 rounded">
                        <AlertCircle size={12} /> Incident Created Successfully
                    </div>
                )}
            </form>
        </div>
    );
};
