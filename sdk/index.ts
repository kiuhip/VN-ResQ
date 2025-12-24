import axios from 'axios';

export interface IncidentData {
  text: string;
  source?: string;
}

export interface IncidentResponse {
  id: string;
  locationText: string;
  incidentType: string;
  urgency: string;
  latitude: number;
  longitude: number;
  status: string;
}

export class VNResQSDK {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Báo cáo một sự cố mới bằng văn bản tự nhiên.
   * AI sẽ tự động trích xuất thông tin và tọa độ.
   */
  async reportIncident(data: IncidentData): Promise<IncidentResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/incidents`, {
        text: data.text,
        source: data.source || 'external_sdk'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to report incident: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả các sự cố đang hoạt động.
   */
  async getAllIncidents(): Promise<IncidentResponse[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/incidents`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
  }

  /**
   * Kiểm tra trạng thái một sự cố cụ thể.
   */
  async getIncidentStatus(id: string): Promise<IncidentResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/incidents/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch incident status: ${error.message}`);
    }
  }
  /**
   * Đăng ký nhận thông báo sự cố thời gian thực qua SSE.
   * Hỗ trợ Geo-fencing nếu truyền vào bounds.
   */
  subscribeToIncidents(callback: (data: any) => void, area?: { north: number, south: number, east: number, west: number }) {
    const url = new URL(`${this.baseUrl}/stream`);
    if (area) {
        url.searchParams.append('north', area.north.toString());
        url.searchParams.append('south', area.south.toString());
        url.searchParams.append('east', area.east.toString());
        url.searchParams.append('west', area.west.toString());
    }

    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection failed:", err);
      eventSource.close();
    };

    return () => eventSource.close(); // Return cleanup function
  }
}
