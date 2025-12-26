import { z } from "zod";

export interface ResQClientOptions {
  baseUrl: string;
  token?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean>;
  body?: any;
  headers?: Record<string, string>;
}

export interface ResQErrorDetails {
  status: number;
  message: string;
  details?: any;
  requestId?: string;
}

export class ResQError extends Error implements ResQErrorDetails {
  status: number;
  details?: any;
  requestId?: string;

  constructor(data: ResQErrorDetails) {
    super(data.message);
    this.name = "ResQError";
    this.status = data.status;
    this.details = data.details;
    this.requestId = data.requestId;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResQError);
    }
  }
}

/* --- Team Schema --- */
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["idle", "en_route", "on_site", "busy"]),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  capabilities: z.array(z.string()).optional(),
});

export type Team = z.infer<typeof TeamSchema>;

/* --- Rescue Location Schema --- */
export const RescueLocationSchema = z.object({
  id: z.string(),
  text: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  urgency: z.string().optional(),
  incidentType: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
});

export type RescueLocation = z.infer<typeof RescueLocationSchema>;

export const RescueLocationCreateInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  latitude: z.number(),
  longitude: z.number(),
  urgency: z.string().optional(),
  incidentType: z.string().optional(),
});

export type RescueLocationCreateInput = z.infer<
  typeof RescueLocationCreateInputSchema
>;
