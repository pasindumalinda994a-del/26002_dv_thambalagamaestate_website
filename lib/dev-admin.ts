import type { Payload } from "payload";

const MIN_PASSWORD_LENGTH = 12;

/**
 * In local development, ensure the DEV_ADMIN_* user exists so login prefill works.
 * Never runs on Vercel or outside development. Create-only — never overwrites passwords.
 */
function classifyMongoUri(mongoUri: string): "localhost" | "atlas" | "other" {
  if (/127\.0\.0\.1|localhost/i.test(mongoUri)) return "localhost";
  if (/mongodb\.net|atlas/i.test(mongoUri)) return "atlas";
  return "other";
}

export async function ensureDevAdminUser(payload: Payload): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || "";
  const mongoKind = classifyMongoUri(mongoUri);

  // #region agent log
  fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9038dd",
    },
    body: JSON.stringify({
      sessionId: "9038dd",
      runId: "post-fix",
      hypothesisId: "A",
      location: "lib/dev-admin.ts:entry",
      message: "ensureDevAdminUser entry",
      data: {
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelSet: Boolean(process.env.VERCEL),
        hasDevEmail: Boolean(process.env.DEV_ADMIN_EMAIL?.trim()),
        hasDevPassword: Boolean(process.env.DEV_ADMIN_PASSWORD),
        passwordLen: process.env.DEV_ADMIN_PASSWORD?.length ?? 0,
        mongoKind,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (process.env.NODE_ENV !== "development") {
    // #region agent log
    fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9038dd",
      },
      body: JSON.stringify({
        sessionId: "9038dd",
        runId: "post-fix",
        hypothesisId: "E",
        location: "lib/dev-admin.ts:skip-non-dev",
        message: "Skipped: not development",
        data: { nodeEnv: process.env.NODE_ENV ?? null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return;
  }

  // Deployed environments (including Vercel preview) must never seed admin users.
  if (process.env.VERCEL) {
    // #region agent log
    fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9038dd",
      },
      body: JSON.stringify({
        sessionId: "9038dd",
        runId: "post-fix",
        hypothesisId: "D",
        location: "lib/dev-admin.ts:skip-vercel",
        message: "Skipped: VERCEL set",
        data: { vercel: process.env.VERCEL },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return;
  }

  // Never seed against shared/remote DBs (e.g. Atlas used from local .env.local).
  if (mongoKind !== "localhost") {
    // #region agent log
    fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9038dd",
      },
      body: JSON.stringify({
        sessionId: "9038dd",
        runId: "post-fix",
        hypothesisId: "A",
        location: "lib/dev-admin.ts:skip-remote-mongo",
        message: "Skipped: remote MongoDB",
        data: { mongoKind, action: "blocked-remote" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.info(
      `[dev-admin] Skipping seed: MONGODB_URI is ${mongoKind}, not localhost. Use your existing Users login when pointed at a shared/Atlas database.`,
    );
    return;
  }

  const email = process.env.DEV_ADMIN_EMAIL?.trim();
  const password = process.env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.info(
      "[dev-admin] Skipping seed: set DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD in .env.local",
    );
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.info(
      `[dev-admin] Skipping seed: DEV_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
    return;
  }

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    // #region agent log
    fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9038dd",
      },
      body: JSON.stringify({
        sessionId: "9038dd",
        runId: "post-fix",
        hypothesisId: "A",
        location: "lib/dev-admin.ts:exists",
        message: "Dev admin already exists on connected DB",
        data: {
          mongoKind,
          emailDomain: email.includes("@") ? email.split("@")[1] : null,
          action: "noop-existing",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.info(`[dev-admin] User already exists: ${email}`);
    return;
  }

  // #region agent log
  fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9038dd",
    },
    body: JSON.stringify({
      sessionId: "9038dd",
      runId: "post-fix",
      hypothesisId: "A",
      location: "lib/dev-admin.ts:create",
      message: "About to create dev admin on connected DB",
      data: {
        mongoKind,
        emailDomain: email.includes("@") ? email.split("@")[1] : null,
        action: "create",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  await payload.create({
    collection: "users",
    data: {
      email,
      password,
      name: "Dev Admin",
    },
    overrideAccess: true,
  });

  console.info(`[dev-admin] Seeded local admin user: ${email}`);
}
