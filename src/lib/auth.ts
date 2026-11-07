import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  throw new Error("BETTER_AUTH_URL (or NEXT_PUBLIC_APP_URL) is not set");
}

// The secret is read from BETTER_AUTH_SECRET and deliberately never passed
// here, so it cannot reach the repository. Better Auth only *throws* on its
// own hardcoded default secret, and only when NODE_ENV is exactly
// "production"; a short or low-entropy value merely logs a warning and runs.
// So the environment value has to be real random bytes
// (`openssl rand -base64 32`). Treat it as a full-trust key: it signs the
// HS256 email-verification and change-email tokens that the unauthenticated
// GET /verify-email accepts, so a leaked secret means account takeover even
// though sessions themselves are checked against the database.
// Rotation uses BETTER_AUTH_SECRETS with versioned `<version>:<secret>`
// entries, and invalidates every existing session cookie.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // Pin the origin. Left unset, Better Auth derives it from request headers
  // and builds its trusted-origin list from that.
  baseURL: appUrl,
  trustedOrigins: [appUrl],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // Leave cookieCache off. Enabling it makes the secret a direct
    // session-forgery key, because the cached session is trusted without a
    // database lookup.
  },
  // Rate limiting otherwise only switches on when NODE_ENV === "production",
  // which hides the 3-per-10s sign-in limit during development. Storage is
  // in-memory, so counters are per-instance; move to `storage: "database"`
  // once Better Auth's tables exist.
  rateLimit: {
    enabled: true,
  },
  advanced: {
    // Keyed off the origin's scheme rather than NODE_ENV, so a production
    // build served over http://localhost does not try to set Secure cookies.
    useSecureCookies: appUrl.startsWith("https://"),
  },
  plugins: [nextCookies()],
});
