import { useState } from 'react';
import { Phone, Users, Database, LayoutGrid, MapPin, Globe } from 'lucide-react';
import { HotlinePanel } from '../components/intake/HotlinePanel';
import { FanpagePanel } from '../components/intake/FanpagePanel';
import { SDKPanel } from '../components/intake/SDKPanel';

export const IncidentForm = () => {
    const [activeTab, setActiveTab] = useState<'hotline' | 'fanpage' | 'sdk'>('hotline');

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-4xl w-full bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl z-10 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-gray-900/80 border-r border-gray-800 p-6 flex flex-col">
                    <div className="mb-8 flex items-center gap-2 text-blue-500 font-bold text-xl tracking-tight">
                        <Globe size={24} /> VN-RESQ
                    </div>

                    <nav className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('hotline')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'hotline'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-900/10'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                        >
                            <Phone size={18} />
                            <span className="font-medium text-sm">Chế độ Hotline</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('fanpage')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'fanpage'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-900/10'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                        >
                            <Users size={18} />
                            <span className="font-medium text-sm">Tin Nhắn Fanpage</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sdk')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'sdk'
                                ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-lg shadow-purple-900/10'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                        >
                            <Database size={18} />
                            <span className="font-medium text-sm">Kết Nối SDK</span>
                        </button>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-800">
                        <a href="/dashboard" className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-gray-700">
                                <LayoutGrid size={16} />
                            </div>
                            <span className="text-xs font-medium">Bảng Điều Phối Cứu Hộ</span>
                        </a>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 bg-black/20">
                    <header className="mb-8 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                {activeTab === 'hotline' && 'Tổng Đài Khẩn Cấp'}
                                {activeTab === 'fanpage' && 'Lắng Nghe Mạng Xã Hội'}
                                {activeTab === 'sdk' && 'Kết Nối Cho Nhà Phát Triển'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {activeTab === 'hotline' && 'Ghi nhận cuộc gọi khẩn cấp qua giọng nói hoặc nhập thủ công.'}
                                {activeTab === 'fanpage' && 'Theo dõi và xử lý tin nhắn từ Facebook/Zalo.'}
                                {activeTab === 'sdk' && 'Quản lý khóa API và kết nối cơ sở dữ liệu.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Hệ Thống Sẵn Sàng
                        </div>
                    </header>

                    {/* Dynamic Panel Content */}
                    <div className="relative min-h-[400px]">
                        {activeTab === 'hotline' && <HotlinePanel />}
                        {activeTab === 'fanpage' && <FanpagePanel />}
                        {activeTab === 'sdk' && <SDKPanel />}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-[10px] text-gray-600 flex gap-4">
                <span className="flex items-center gap-1"><MapPin size={10} /> Hanoi, VN</span>
                <span>•</span>
                <span>v2.1.0-build.482</span>
            </div>
        </div>
    );
};
