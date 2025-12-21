import Link from 'next/link';
import { AlertTriangle, Search, Phone } from 'lucide-react';

export default function UserLanding() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center mb-8">
                <h1 className="text-4xl font-bold text-red-600 mb-2">VN-ResQ</h1>
                <p className="text-slate-600">Hệ thống hỗ trợ cứu trợ khẩn cấp</p>
            </div>

            <div className="grid gap-4 w-full max-w-md">
                <Link href="/user/report" className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-red-100 hover:border-red-300 transition-all group">
                    <div className="bg-red-100 p-3 rounded-full mr-4 group-hover:bg-red-200 transition-colors">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg text-slate-900">Gửi Yêu Cầu Cứu Trợ</h3>
                        <p className="text-sm text-slate-500">Báo cáo sự cố, yêu cầu nhu yếu phẩm</p>
                    </div>
                </Link>

                <Link href="/user/track" className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 transition-all group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                        <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg text-slate-900">Tra Cứu Trạng Thái</h3>
                        <p className="text-sm text-slate-500">Xem tiến độ xử lý yêu cầu của bạn</p>
                    </div>
                </Link>

                <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-center mb-2">
                        <Phone className="w-5 h-5 text-yellow-700 mr-2" />
                        <span className="font-bold text-yellow-800">Hotline Khẩn Cấp</span>
                    </div>
                    <p className="text-2xl font-black text-center text-yellow-900">1900 1122</p>
                </div>
            </div>
        </div>
    );
}
