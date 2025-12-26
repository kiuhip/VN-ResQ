import { z } from "zod";
import { ResQClient } from "./client";

// --- Zod Schemas ---

export const IncidentSchema = z.object({
  id: z.string(),
  source: z.string().optional(),
  locationText: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  peopleCount: z.number().optional().default(1),
  urgency: z.string().optional(),
  incidentType: z.string().optional(),
  status: z.string().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(), // API returns string usually
});

export type Incident = z.infer<typeof IncidentSchema>;

export const IncidentCreateInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  source: z.string().optional(),
});

export type IncidentCreateInput = z.infer<typeof IncidentCreateInputSchema>;

export const IncidentListResponseSchema = z.array(IncidentSchema);

export type IncidentListResponse = z.infer<typeof IncidentListResponseSchema>;

// --- SDK Class ---

export class IncidentsSDK {
  private client: ResQClient;

  constructor(client: ResQClient) {
    this.client = client;
  }

  /**
   * Create a new incident (POST /incidents)
   */
  async create(input: IncidentCreateInput): Promise<Incident> {
    // 1. Runtime Input Validation
    const validData = IncidentCreateInputSchema.parse(input);

    // 2. Request
    const response = await this.client.request<unknown>({
      method: "POST",
      path: "/incidents",
      body: validData,
    });

    // 3. Runtime Response Validation
    return IncidentSchema.parse(response);
  }

  /**
   * Get an incident by ID (GET /incidents/:id)
   */
  async get(id: string): Promise<Incident> {
    const response = await this.client.request<unknown>({
      method: "GET",
      path: `/incidents/${id}`,
    });

    return IncidentSchema.parse(response);
  }

  /**
   * List incidents (GET /incidents)
   */
  async list(params?: {
    status?: string;
    from?: string;
    to?: string;
    q?: string;
  }): Promise<IncidentListResponse> {
    const response = await this.client.request<unknown>({
      method: "GET",
      path: "/incidents",
      query: params,
    });

    return IncidentListResponseSchema.parse(response);
  }

  /**
   * Update an incident (PATCH /incidents/:id)
   */
  async update(
    id: string,
    patch: Partial<IncidentCreateInput>
  ): Promise<Incident> {
    // 1. Validate Patch
    const validPatch = IncidentCreateInputSchema.partial().parse(patch);

    // 2. Request
    const response = await this.client.request<unknown>({
      method: "PATCH",
      path: `/incidents/${id}`,
      body: validPatch, // PATCH request traditionally sends partial body
    });

    // 3. Validate Response
    return IncidentSchema.parse(response);
  }
}
