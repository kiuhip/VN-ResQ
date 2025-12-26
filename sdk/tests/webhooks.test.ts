import { describe, it, expect } from "vitest";
import { Webhooks } from "../src/webhooks";

describe("Webhooks Toolkit", () => {
  const secret = "my-secret-key";
  const payload = JSON.stringify({ event: "incident.created", id: "123" });

  it("sign() should produce a valid HMAC SHA256 hex signature", () => {
    const signature = Webhooks.sign(payload, secret);
    // SHA256 hex string length is 64 characters
    expect(signature).toHaveLength(64);
    expect(signature).toMatch(/^[0-9a-f]+$/);

    // Deterministic check
    const signature2 = Webhooks.sign(payload, secret);
    expect(signature).toBe(signature2);
  });

  it("verify() should return true for valid signature", () => {
    const signature = Webhooks.sign(payload, secret);
    expect(Webhooks.verify(payload, signature, secret)).toBe(true);
  });

  it("verify() should return false for invalid signature", () => {
    const signature = Webhooks.sign(payload, secret);
    // Tamper signature
    const invalidSig = signature.replace("a", "b");
    expect(Webhooks.verify(payload, invalidSig, secret)).toBe(false);
  });

  it("verify() should return false for tampered payload", () => {
    const signature = Webhooks.sign(payload, secret);
    const tamperedPayload = payload + " ";
    expect(Webhooks.verify(tamperedPayload, signature, secret)).toBe(false);
  });

  it("verify() should return false for wrong secret", () => {
    const signature = Webhooks.sign(payload, secret);
    expect(Webhooks.verify(payload, signature, "wrong-secret")).toBe(false);
  });

  it("parseEvent() should parse valid JSON", () => {
    const event = Webhooks.parseEvent<{ event: string; id: string }>(payload);
    expect(event.event).toBe("incident.created");
    expect(event.id).toBe("123");
  });

  it("parseEvent() should throw on invalid JSON", () => {
    expect(() => Webhooks.parseEvent("{ invalid json ")).toThrow(
      "Failed to parse webhook event"
    );
  });
});
