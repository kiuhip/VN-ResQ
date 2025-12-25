import { Facebook, Send } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const FanpagePanel = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSimulateMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setStatus('idle');
        try {
            // Simulate Real Facebook Webhook Structure
            const webhookPayload = {
                object: "page",
                entry: [
                    {
                        id: "109283741",
                        time: Date.now(),
                        messaging: [
                            {
                                sender: { id: "user_12345" },
                                recipient: { id: "page_vnresq" },
                                timestamp: Date.now(),
                                message: {
                                    mid: "mid.123456789",
                                    text: message
                                }
                            }
                        ]
                    }
                ]
            };

            await axios.post('http://localhost:3000/api/messenger/webhook', webhookPayload);

            setStatus('success');
            setMessage('');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-blue-400 font-bold flex items-center gap-2">
                        <Facebook size={18} /> Fanpage Chính Thức
                    </h3>
                    <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/30 uppercase tracking-wider">
                        Webhook Hoạt Động
                    </span>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 h-48 overflow-y-auto space-y-3 mb-4">
                    <div className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0"></div>
                        <div className="bg-gray-800 p-2 rounded-r-lg rounded-bl-lg text-xs text-gray-300 max-w-[80%]">
                            Xin chào, có đội cứu hộ nào gần Cầu Giấy không?
                        </div>
                    </div>
                    <div className="flex gap-2.5 flex-row-reverse">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-[8px]">AD</div>
                        <div className="bg-blue-600 text-white p-2 rounded-l-lg rounded-br-lg text-xs max-w-[80%]">
                            Vui lòng mô tả tình trạng khẩn cấp của bạn.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSimulateMessage} className="relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mô phỏng tin nhắn người dùng..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-full pl-4 pr-10 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button
                        disabled={loading}
                        className="absolute right-1 top-1 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        <Send size={12} className="text-white ml-0.5" />
                    </button>
                </form>
                {status === 'success' && <p className="text-green-500 text-[10px] mt-2 text-center">Đã gửi mô phỏng webhook!</p>}
            </div>

            <div className="p-4 rounded-lg border border-dashed border-gray-700 text-center">
                <p className="text-gray-500 text-xs">Đang chờ tin nhắn mới từ Meta Webhook...</p>
            </div>
        </div>
    );
};
