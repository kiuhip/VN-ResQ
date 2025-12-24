import { incidentService } from '../src/services/incident.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const cases = [
    "Cần cứu hộ gấp, nhà tôi bị ngập ở số 10 ngõ 84 Trần Thái Tông, Cầu Giấy",
    "Tai nạn nghiêm trọng tại ngã tư Khuất Duy Tiến giao với Nguyễn Trãi",
    "Cháy tại cửa hàng quần áo 234 phố Chùa Bộc, Đống Đa",
    "Có người đuối nước ở Hồ Tây, gần đoạn đường Thanh Niên"
];

async function runTests() {
    console.log("🧪 Testing AI + Geocoding for multiple cases...\n");
    for (const text of cases) {
        console.log(`📝 Input: "${text}"`);
        try {
            const incident = await incidentService.createFromText('test-suite', text);
            console.log(`✅ Extracted: "${incident.locationText}"`);
            console.log(`📍 GPS: ${incident.latitude}, ${incident.longitude}`);
            console.log("------------------------------------------");
        } catch (e) {
            console.error("❌ Failed:", e);
        }
    }
}

runTests();
