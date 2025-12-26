import { v4 as uuidv4 } from "uuid";
import { ResQClientOptions, RequestOptions, ResQError } from "./types";

export class ResQClient {
  private baseUrl: string;
  private token?: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(options: ResQClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.token = options.token;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs || 10000;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, query, body, headers = {} } = options;

    // 1. Construct URL
    const url = new URL(
      `${this.baseUrl}${path.startsWith("/") ? path : "/" + path}`
    );
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // 2. Prepare Headers
    const reqHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    };

    if (this.token) {
      reqHeaders["Authorization"] = `Bearer ${this.token}`;
    }
    if (this.apiKey) {
      reqHeaders["X-API-Key"] = this.apiKey;
    }

    // 3. Idempotency Key
    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      const existingKey = Object.keys(reqHeaders).find(
        (k) => k.toLowerCase() === "idempotency-key"
      );
      if (!existingKey) {
        reqHeaders["Idempotency-Key"] = uuidv4();
      }
    }

    // 4. Timeout Signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 5. Handle Response
      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { message: response.statusText };
        }

        throw new ResQError({
          status: response.status,
          message: errorBody.message || errorBody.error || "Unknown Error",
          details: errorBody,
        });
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      try {
        return (await response.json()) as T;
      } catch (e) {
        // If response is not JSON but OK (e.g. 200 OK with text/plain), return text?
        // Requirement says "JSON response", so failing to parse JSON is likely an error or empty body
        // For robustness let's just return empty object if JSON parsing fails on a 200
        return {} as T;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ResQError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw new ResQError({
          status: 408,
          message: `Request timeout after ${this.timeoutMs}ms`,
        });
      }
      throw new ResQError({
        status: 0,
        message: error.message || "Network Error",
        details: error,
      });
    }
  }
}
