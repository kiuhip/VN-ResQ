'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        reporter_name: '',
        reporter_phone: '',
        location_desc: '',
        incident_type: 'Flood',
        num_people: 1,
        description: '',
        lat: 21.0285, // Default Hanoi
        lng: 105.8542
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/incidents/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Đã gửi yêu cầu thành công!");
                router.push('/user');
            } else {
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (error) {
            console.error(error);
            alert("Không thể kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-slate-800">Báo Cáo Sự Cố</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
                        <input type="text" required className="w-full p-2 border rounded-lg"
                            value={formData.reporter_name}
                            onChange={e => setFormData({ ...formData, reporter_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                        <input type="tel" required className="w-full p-2 border rounded-lg"
                            value={formData.reporter_phone}
                            onChange={e => setFormData({ ...formData, reporter_phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ / Vị trí</label>
                        <input type="text" required className="w-full p-2 border rounded-lg"
                            value={formData.location_desc}
                            onChange={e => setFormData({ ...formData, location_desc: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Loại sự cố</label>
                            <select className="w-full p-2 border rounded-lg"
                                value={formData.incident_type}
                                onChange={e => setFormData({ ...formData, incident_type: e.target.value })}
                            >
                                <option value="Flood">Ngập lụt</option>
                                <option value="Medical">Cấp cứu y tế</option>
                                <option value="Shortage">Thiếu lương thực</option>
                                <option value="Trapped">Mắc kẹt</option>
                                <option value="Other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số người</label>
                            <input type="number" min="1" className="w-full p-2 border rounded-lg"
                                value={formData.num_people}
                                onChange={e => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                        <textarea className="w-full p-2 border rounded-lg h-24"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">
                            {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Cứu Trợ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
