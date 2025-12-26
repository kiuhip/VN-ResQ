import { createHmac, timingSafeEqual } from "crypto";

export const Webhooks = {
  /**
   * Calculate HMAC SHA256 signature for the given payload and secret.
   * Returns a hex string.
   */
  sign(payloadRaw: string, secret: string): string {
    return createHmac("sha256", secret).update(payloadRaw).digest("hex");
  },

  /**
   * Verify that the signature matches the payload and secret.
   * Uses constant-time comparison to prevent timing attacks.
   */
  verify(payloadRaw: string, signature: string, secret: string): boolean {
    const expectedSignature = this.sign(payloadRaw, secret);

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // crypto.timingSafeEqual throws if lengths differ
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  },

  /**
   * Parse a raw JSON payload into a typed event object.
   * Throws if JSON is invalid.
   */
  parseEvent<T = any>(payloadRaw: string): T {
    try {
      return JSON.parse(payloadRaw);
    } catch (error: any) {
      throw new Error(`Failed to parse webhook event: ${error.message}`);
    }
  },
};
