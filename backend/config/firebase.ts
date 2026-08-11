import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const GOOGLE_PUBLIC_KEYS_URL =
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

// Simple in-memory cache for Google's public keys
let cachedKeys: Record<string, string> = {};
let cacheExpiresAt = 0;

/**
 * Fetches and caches Google's public keys used to sign Firebase tokens.
 */
const getGooglePublicKeys = async (): Promise<Record<string, string>> => {
    if (Date.now() < cacheExpiresAt && Object.keys(cachedKeys).length > 0) {
        return cachedKeys;
    }

    const response = await fetch(GOOGLE_PUBLIC_KEYS_URL);
    if (!response.ok) {
        throw new Error(`[Firebase] Failed to fetch Google public keys: ${response.statusText}`);
    }

    // Google sets Cache-Control: max-age=X — use it for cache TTL
    const cacheControl = response.headers.get("cache-control") ?? "";
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const ttlSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

    cachedKeys = (await response.json()) as Record<string, string>;
    cacheExpiresAt = Date.now() + ttlSeconds * 1000;

    return cachedKeys;
};

export interface FirebaseDecodedToken {
    uid: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
    aud: string;
    iss: string;
    sub: string;
}

/**
 * Verifies a Firebase ID Token and returns the decoded payload.
 * @param idToken - The Firebase ID Token from the frontend (result.user.getIdToken())
 * @throws Error if the token is invalid, expired, or fails signature check.
 */
export const verifyFirebaseToken = async (idToken: string): Promise<FirebaseDecodedToken> => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("[Firebase] FIREBASE_PROJECT_ID env var is not set.");
    }

    // Decode header to get the key ID (kid)
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === "string" || !decoded.header?.kid) {
        throw new Error("[Firebase] Invalid token format.");
    }

    const { kid } = decoded.header;
    const publicKeys = await getGooglePublicKeys();
    const publicKey = publicKeys[kid];

    if (!publicKey) {
        throw new Error("[Firebase] No matching public key found for token.");
    }

    // Verify signature + standard claims
    const payload = jwt.verify(idToken, publicKey, {
        algorithms: ["RS256"],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`,
    }) as FirebaseDecodedToken;

    if (!payload.sub) {
        throw new Error("[Firebase] Token missing subject (uid).");
    }

    // Map sub → uid for consistency
    payload.uid = payload.sub;

    return payload;
};
