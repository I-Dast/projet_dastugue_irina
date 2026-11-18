import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config";

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

export function createAdminToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string): number | null {
  const [payload, signature, ...extraParts] = token.split(".");
  if (
    payload === undefined ||
    signature === undefined ||
    extraParts.length > 0 ||
    payload.length > 1024 ||
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !/^[\da-f]{64}$/i.test(signature)
  ) {
    return null;
  }

  const expectedSignature = Buffer.from(sign(payload), "hex");
  const suppliedSignature = Buffer.from(signature, "hex");
  if (!timingSafeEqual(expectedSignature, suppliedSignature)) {
    return null;
  }

  try {
    const claims: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (
      typeof claims !== "object" ||
      claims === null ||
      !("sub" in claims) ||
      !("exp" in claims)
    ) {
      return null;
    }

    const userId = claims.sub;
    const expiresAt = claims.exp;
    if (
      typeof userId !== "number" ||
      !Number.isSafeInteger(userId) ||
      typeof expiresAt !== "number" ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

function sign(payload: string): string {
  return createHmac("sha256", config.authTokenSecret)
    .update(payload)
    .digest("hex");
}
