import { afterEach, describe, expect, it, vi } from "vitest";

import { createSessionToken, verifySessionToken } from "./session";

afterEach(() => vi.useRealTimers());

describe("session tokens", () => {
  it("verifies a token it created (round trip)", () => {
    const token = createSessionToken("admin@acme.com");
    expect(verifySessionToken(token)).toBe("admin@acme.com");
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken("admin@acme.com");
    // Forge the payload to a different email, keep the original signature.
    const forgedPayload = Buffer.from(
      `hacker@evil.com|${Date.now() + 100_000}`,
    ).toString("base64url");
    const forged = `${forgedPayload}.${token.split(".")[1]}`;
    expect(verifySessionToken(forged)).toBeNull();
  });

  it("rejects garbage and missing tokens", () => {
    expect(verifySessionToken(undefined)).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("not-a-token")).toBeNull();
    expect(verifySessionToken("a.b.c")).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = createSessionToken("admin@acme.com");
    // Jump 8 days into the future — past the 7-day expiry.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
    expect(verifySessionToken(token)).toBeNull();
  });
});
