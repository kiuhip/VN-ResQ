import { incidentService } from '../src/services/incident.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
    const text = "Cháy kinh khủng ở 234 phố Chùa Bộc, Đống Đa";
    console.log("Testing:", text);
    const incident = await incidentService.createFromText('manual', text);
    console.log("Final Record:", {
        location: incident.locationText,
        original_desc: incident.description,
        lat: incident.latitude,
        lng: incident.longitude
    });
}

test();
