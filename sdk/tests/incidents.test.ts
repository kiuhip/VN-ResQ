import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { ResQClient } from "../src/client";
import { IncidentsSDK, Incident } from "../src/incidents";

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

describe("IncidentsSDK", () => {
  const baseUrl = "http://api.resq.vn";
  let client: ResQClient;
  let incidents: IncidentsSDK;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ResQClient({ baseUrl, apiKey: "test-key" });
    incidents = new IncidentsSDK(client);
  });

  const mockIncident: Incident = {
    id: "inc-123",
    locationText: "Hanoi",
    status: "open",
    source: "app",
    urgency: "high",
    peopleCount: 5,
  };

  it("create() should send correct POST request and validate response", async () => {
    (global.fetch as Mock).mockReturnValue(createFetchResponse(mockIncident));

    const input = { text: "Emergency at Ba Dinh", source: "app" };
    const result = await incidents.create(input);

    // Verify fetch call
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/incidents"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Idempotency-Key": expect.any(String),
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(input),
      })
    );

    // Verify result matches schema parsed
    expect(result).toEqual(mockIncident);
  });

  it("create() should throw if input is invalid", async () => {
    const input: any = { text: "" }; // Empty text should fail min(1)
    await expect(incidents.create(input)).rejects.toThrow();
  });

  it("list() should send correct query params", async () => {
    (global.fetch as Mock).mockReturnValue(createFetchResponse([mockIncident]));

    const params = { status: "open", q: "flood" };
    await incidents.list(params);

    expect(global.fetch).toHaveBeenCalledWith(
      // Check URL contains query
      expect.stringMatching(/\/incidents\?.*status=open/),
      expect.objectContaining({ method: "GET" })
    );
    // And also q=flood
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/q=flood/),
      expect.anything()
    );
  });

  it("update() should send correct PATCH request", async () => {
    const patchedIncident = { ...mockIncident, description: "Updated" };
    (global.fetch as Mock).mockReturnValue(
      createFetchResponse(patchedIncident)
    );

    const patch = { text: "Updated text" };
    await incidents.update("inc-123", patch);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/incidents/inc-123"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    );
  });

  it("should throw if response validation fails", async () => {
    // Return object missing required 'id'
    (global.fetch as Mock).mockReturnValue(
      createFetchResponse({ status: "ok" })
    );

    await expect(incidents.get("inc-123")).rejects.toThrow();
  });
});
