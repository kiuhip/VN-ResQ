import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { ResQClient } from "../src/client";
import { MissionsSDK, MissionStatus, Mission } from "../src/missions";

// Mock global fetch
global.fetch = vi.fn();

function createFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    clone: () => ({ json: () => Promise.resolve(data) }),
  } as unknown as Response);
}

describe("MissionsSDK", () => {
  const baseUrl = "http://api.resq.vn";
  let client: ResQClient;
  let missions: MissionsSDK;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ResQClient({ baseUrl });
    missions = new MissionsSDK(client);
  });

  const mockMission: Mission = {
    id: "ms-001",
    incidentId: "inc-123",
    teamId: "team-A",
    status: MissionStatus.ASSIGNED,
    createdAt: new Date().toISOString(),
  };

  it("assign() should send correct auto-assign request", async () => {
    (global.fetch as Mock).mockReturnValue(createFetchResponse(mockMission));

    const input = { incidentId: "inc-123", auto: true };
    const result = await missions.assign(input);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/missions/assign"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Idempotency-Key": expect.any(String),
        }),
        body: JSON.stringify(input),
      })
    );
    expect(result).toEqual(mockMission);
  });

  it("reject() should send POST with reason", async () => {
    const rejectedMission = { ...mockMission, status: MissionStatus.REJECTED };
    (global.fetch as Mock).mockReturnValue(
      createFetchResponse(rejectedMission)
    );

    await missions.reject("ms-001", "Too far");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/missions/ms-001/reject"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "Too far" }),
      })
    );
  });

  it("updateStatus() should validate and send PATCH", async () => {
    const updatedMission = { ...mockMission, status: MissionStatus.EN_ROUTE };
    (global.fetch as Mock).mockReturnValue(createFetchResponse(updatedMission));

    const payload = {
      status: MissionStatus.EN_ROUTE,
      note: "On the way",
      location: { lat: 21.0, lng: 105.8 },
    };

    const result = await missions.updateStatus("ms-001", payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/missions/ms-001/status"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      })
    );
    expect(result.status).toBe(MissionStatus.EN_ROUTE);
  });

  it("report() should validate input", async () => {
    const reportedMission = { ...mockMission, status: MissionStatus.RESOLVED };
    (global.fetch as Mock).mockReturnValue(
      createFetchResponse(reportedMission)
    );

    const payload = { rescuedCount: 5, needs: ["boat"] };
    await missions.report("ms-001", payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/missions/ms-001/report"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  });

  it("should throw if invalid status provided", async () => {
    const payload: any = { status: "INVALID_STATUS" };
    await expect(missions.updateStatus("ms-001", payload)).rejects.toThrow();
  });
});
