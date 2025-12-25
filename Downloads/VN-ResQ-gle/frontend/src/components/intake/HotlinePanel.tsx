import { Phone, Mic, Edit3, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const HotlinePanel = () => {
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                setAudioFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

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
                        <h3 className="text-xs font-bold text-red-100 uppercase tracking-wide">Đường Dây Sẵn Sàng</h3>
                        <p className="text-[10px] text-red-300">Tổng đài viên: #OP-2024</p>
                    </div>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1"><Edit3 size={12} /> Nhật ký cuộc gọi / Bản ghi / Âm thanh</span>

                        {/* Audio Upload Control */}
                        <div className="flex items-center gap-2">
                            {audioFile ? (
                                <div className="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                    <span className="text-[10px] text-green-400 max-w-[100px] truncate">{audioFile.name}</span>
                                    <button onClick={() => setAudioFile(null)} type="button" className="text-red-400 hover:text-red-300">×</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded border transition-all ${isRecording
                                            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                                            : 'bg-green-500/10 border-green-500/20 text-green-400 hover:text-green-300'
                                            }`}
                                    >
                                        <Mic size={10} /> {isRecording ? 'Dừng Ghi' : 'Bật Mic'}
                                    </button>

                                    <label className="cursor-pointer text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                        <Edit3 size={10} /> Tải Lên Âm Thanh
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Transcribe Button - Only shows if file is present */}
                            {audioFile && (
                                <button
                                    type="button"
                                    onClick={handleTranscribe}
                                    disabled={loading}
                                    className="text-[10px] bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded font-bold animate-in fade-in"
                                >
                                    {loading ? '...' : 'Chuyển thành Văn bản'}
                                </button>
                            )}
                        </div>
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full h-32 bg-black/30 border border-gray-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none font-mono"
                        placeholder="Nhập ghi chú của tổng đài viên HOẶC tải lên âm thanh và nhấn 'Chuyển thành Văn bản' để điền tự động..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-bold text-gray-400 transition-colors"
                    >
                        Giữ Cuộc Gọi
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !details.trim()}
                        className="flex-[2] py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang Xử Lý...' : <><Send size={14} /> Tạo Báo Cáo Sự Cố</>}
                    </button>
                </div>
                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-400 text-xs justify-center bg-green-900/20 p-2 rounded">
                        <AlertCircle size={12} /> Tạo sự cố thành công
                    </div>
                )}
            </form>
        </div>
    );
};
