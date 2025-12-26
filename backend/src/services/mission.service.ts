import { PrismaClient } from "@prisma/client";
import { dispatchService } from "./dispatch.service";

const prisma = new PrismaClient();

export class MissionService {
  async assign(data: { incidentId: string; auto?: boolean; teamId?: string }) {
    if (data.auto) {
      const result = await dispatchService.dispatchTeamToIncident(
        data.incidentId
      );
      return result.assignment;
    }

    if (!data.teamId) throw new Error("Team ID required for manual assignment");

    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        incidentId: data.incidentId,
        status: { not: "resolved" },
      },
    });

    if (existingAssignment) {
      throw new Error(`Incident is already assigned to another team.`);
    }

    await prisma.team.update({
      where: { id: data.teamId },
      data: { status: "busy" },
    });

    await prisma.incident.update({
      where: { id: data.incidentId },
      data: { status: "assigned" },
    });

    return prisma.assignment.create({
      data: {
        incidentId: data.incidentId,
        teamId: data.teamId,
        status: "assigned",
      },
    });
  }

  async updateStatus(
    id: string,
    status: string,
    notes?: string,
    lat?: number,
    lng?: number
  ) {
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Mission ID ${id} not found. Please verify the ID.`);
    }

    if (lat && lng) {
      await prisma.team.update({
        where: { id: existing.teamId },
        data: { latitude: lat, longitude: lng },
      });
    }

    if (status === "resolved" || status === "done" || status === "cancelled") {
      const normalizedStatus = status === "done" ? "resolved" : status;

      await prisma.team.update({
        where: { id: existing.teamId },
        data: { status: "idle" },
      });

      if (normalizedStatus === "resolved") {
        await prisma.incident.update({
          where: { id: existing.incidentId },
          data: { status: "resolved" },
        });
      } else if (normalizedStatus === "cancelled") {
        await prisma.incident.update({
          where: { id: existing.incidentId },
          data: { status: "open" }, // Re-open incident for next dispatch
        });
      }

      return prisma.assignment.update({
        where: { id },
        data: { status: normalizedStatus },
      });
    }

    return prisma.assignment.update({
      where: { id },
      data: { status },
    });
  }

  async rejectAssignment(id: string, reason?: string) {
    // 1. Mark as cancelled (which sets Team to Idle)
    const cancelledAssign = await this.updateStatus(id, "cancelled", reason);

    // 2. Re-dispatch to another team
    // We must pass the rejected team ID to exclude it
    try {
      console.log(
        `🔄 Re-dispatching incident ${cancelledAssign.incidentId} (excluding team ${cancelledAssign.teamId})`
      );
      const newDispatch = await dispatchService.dispatchTeamToIncident(
        cancelledAssign.incidentId,
        [cancelledAssign.teamId]
      );
      return { ...cancelledAssign, redispatchedTo: newDispatch.team.name };
    } catch (e) {
      console.error("Redispatch failed:", e);
      return {
        ...cancelledAssign,
        redispatchError: "No other teams available",
      };
    }
  }

  async report(id: string, data: any) {
    return prisma.assignment.findUnique({ where: { id } });
  }
  async listPending(teamId: string) {
    return prisma.assignment.findMany({
      where: {
        teamId,
        status: "pending",
      },
      include: {
        incident: true, // Need incident processing details
      },
    });
  }

  async getActiveMission(teamId: string) {
    return prisma.assignment.findFirst({
      where: {
        teamId,
        status: {
          in: ["assigned", "en_route", "en-route", "on_site", "on-site"],
        },
      },
      include: {
        incident: true,
      },
    });
  }

  async getById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        incident: true,
        team: true,
      },
    });
  }

  async requestBackup(id: string) {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Mission not found");

    console.log(
      `🆘 Backup Requested for Incident ${existing.incidentId} by Team ${existing.teamId}`
    );

    // Dispatch another team, excluding the one who requested backup
    const result = await dispatchService.dispatchTeamToIncident(
      existing.incidentId,
      [existing.teamId],
      true // Keep current team active
    );

    return {
      backupTeam: result.team.name,
      assignmentId: result.assignment.id,
    };
  }
}

export const missionService = new MissionService();
