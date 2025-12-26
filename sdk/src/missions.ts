import { z } from "zod";
import { ResQClient } from "./client";

// --- Enums & Schemas ---

export enum MissionStatus {
  ASSIGNED = "assigned",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EN_ROUTE = "en_route",
  ON_SITE = "on_site",
  RESOLVING = "resolving",
  RESOLVED = "resolved",
  CANCELLED = "cancelled",
}

export const MissionSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  assignedTeamId: z.string().optional().nullable(),
  status: z.string(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  notes: z.string().optional().nullable(),
});

export const MissionOfferSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  teamId: z.string(),
  status: z.string(),
  expiresAt: z.string().or(z.date()).optional(),
  mission: MissionSchema.optional(),
});

export type Mission = z.infer<typeof MissionSchema>;
export type MissionOffer = z.infer<typeof MissionOfferSchema>;

export const AssignInputSchema = z.object({
  incidentId: z.string().min(1),
  teamId: z.string().optional(),
  auto: z.boolean().optional(),
});

export type AssignInput = z.infer<typeof AssignInputSchema>;

export const MissionReportInputSchema = z.object({
  rescuedCount: z.number().int().min(0).optional(),
  needs: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
});

export type MissionReportInput = z.infer<typeof MissionReportInputSchema>;

export const UpdateStatusInputSchema = z.object({
  status: z.nativeEnum(MissionStatus),
  note: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export type UpdateStatusInput = z.infer<typeof UpdateStatusInputSchema>;

// --- SDK Class ---

export class MissionsSDK {
  private client: ResQClient;

  constructor(client: ResQClient) {
    this.client = client;
  }

  /**
   * Assign a mission to a team (or auto-assign)
   * POST /missions/assign
   */
  async assign(input: AssignInput): Promise<Mission> {
    const validData = AssignInputSchema.parse(input);
    const response = await this.client.request<unknown>({
      method: "POST",
      path: "/missions/assign",
      body: validData,
    });
    return MissionSchema.parse(response);
  }

  /**
   * Get mission details by ID
   * GET /missions/:id
   */
  async getMission(id: string): Promise<Mission> {
    const response = await this.client.request<unknown>({
      method: "GET",
      path: `/missions/${id}`,
    });
    return MissionSchema.parse(response);
  }

  /**
   * List Offers for a Team
   * GET /missions/offers
   */
  /**
   * Team accepts the mission
   * POST /missions/:id/accept
   */
  async accept(id: string): Promise<Mission> {
    const response = await this.client.request<unknown>({
      method: "POST",
      path: `/missions/${id}/accept`,
    });
    return MissionSchema.parse(response);
  }

  /**
   * Team rejects the mission
   * POST /missions/:id/reject
   */
  async reject(id: string, reason: string): Promise<Mission> {
    const response = await this.client.request<unknown>({
      method: "POST",
      path: `/missions/${id}/reject`,
      body: { reason },
    });
    return MissionSchema.parse(response);
  }

  /**
   * Update mission status
   * PATCH /missions/:id/status
   */
  async updateStatus(id: string, payload: UpdateStatusInput): Promise<Mission> {
    const validData = UpdateStatusInputSchema.parse(payload);
    const response = await this.client.request<unknown>({
      method: "PATCH",
      path: `/missions/${id}/status`,
      body: validData,
    });
    return MissionSchema.parse(response);
  }

  /**
   * Submit a field report
   * POST /missions/:id/report
   */
  async report(id: string, payload: MissionReportInput): Promise<Mission> {
    const validData = MissionReportInputSchema.parse(payload);
    const response = await this.client.request<unknown>({
      method: "POST",
      path: `/missions/${id}/report`,
      body: validData,
    });
    return MissionSchema.parse(response);
  }
}
