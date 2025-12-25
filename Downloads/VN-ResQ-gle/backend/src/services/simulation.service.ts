
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SimulationService {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly SPEED = 0.0005; // ~50 meters per tick (assuming 1 tick = 2s) -> 90km/h scale

    start() {
        if (this.intervalId) return;
        console.log("🚀 Simulation Service Started: Teams will move towards incidents.");

        this.intervalId = setInterval(async () => {
            await this.moveTeams();
        }, 2000); // Update every 2 seconds
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async moveTeams() {
        try {
            // Find all active assignments where team is NOT yet 'on-site' (optional logic, for now just move all busy/assigned)
            // But we only have 'busy' status on Team. Let's join with Assignment.
            // Simplified: Find assignments that are 'assigned' or 'en-route'
            const activeAssignments = await prisma.assignment.findMany({
                where: {
                    status: { in: ['assigned', 'en-route'] }
                },
                include: {
                    team: true,
                    incident: true
                }
            });

            if (activeAssignments.length === 0) return;

            for (const assign of activeAssignments) {
                const team = assign.team;
                const incident = assign.incident;

                if (!team || !incident || !incident.latitude || !incident.longitude) continue;

                // ROUTING LOGIC (OSRM)
                let targetLat = incident.latitude;
                let targetLng = incident.longitude;
                let usingRoute = false;

                if ((assign as any).route) {
                    try {
                        const routePoints = JSON.parse((assign as any).route as string); // [[lng, lat]]
                        const progress = (assign as any).progressIndex || 0;

                        if (progress < routePoints.length) {
                            const point = routePoints[progress];
                            // OSRM: [lng, lat] -> App: lat=point[1], lng=point[0]
                            targetLat = point[1];
                            targetLng = point[0];
                            usingRoute = true;
                        }
                    } catch (e) {
                        // ignore bad json
                    }
                }

                // Calculate Vector
                const dLat = targetLat - team.latitude;
                const dLng = targetLng - team.longitude;
                const distance = Math.sqrt(dLat * dLat + dLng * dLng);

                // Speed factor: If following route (many small points), maybe move faster?
                // Or keep same speed. 0.0005 degrees ~ 50m.
                // OSRM points are usually dense.
                const SNAP_DIST = this.SPEED * 1.5;

                // If very close to TARGET (Waypoint or Final)
                if (distance < SNAP_DIST) {
                    // Snap to point
                    await prisma.team.update({
                        where: { id: team.id },
                        data: { latitude: targetLat, longitude: targetLng }
                    });

                    if (usingRoute) {
                        // Advance to next waypoint
                        await prisma.assignment.update({
                            where: { id: assign.id },
                            data: { progressIndex: { increment: 1 } } as any
                        });
                    }
                } else {
                    // Move
                    const ratio = this.SPEED / distance;
                    const moveLat = dLat * ratio;
                    const moveLng = dLng * ratio;

                    await prisma.team.update({
                        where: { id: team.id },
                        data: {
                            latitude: team.latitude + moveLat,
                            longitude: team.longitude + moveLng
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Simulation Tick Error:", error);
        }
    }
}

export const simulationService = new SimulationService();
