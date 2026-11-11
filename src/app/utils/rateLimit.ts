type Entry = { count: number; resetAt: number };

const memoryHits = new Map<string, Entry>();

/**
 * IP العميل. على Vercel الهيدرز دي بتتحط من المنصة نفسها (مش من العميل)،
 * فالأولوية ليها قبل x-forwarded-for.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  return (
    headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "local"
  );
}

// fallback محلي: مناسب للتطوير أو سيرفر واحد بس
function memoryLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (memoryHits.size > 500) {
    for (const [k, entry] of memoryHits) {
      if (entry.resetAt <= now) memoryHits.delete(k);
    }
  }

  const entry = memoryHits.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

// Upstash عن طريق REST مباشرة (من غير أي package). بيرجع null لو مش متظبط أو فشل.
async function upstashLimited(
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
      ]),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { result?: unknown }[];
    const count = Number(data?.[0]?.result);

    return Number.isFinite(count) ? count > limit : null;
  } catch {
    return null;
  }
}

export async function isRateLimited(
  scope: string,
  ip: string,
  limit = 10,
  windowMs = 60_000,
): Promise<boolean> {
  const key = `rl:${scope}:${ip}`;

  const remote = await upstashLimited(key, limit, Math.ceil(windowMs / 1000));
  if (remote !== null) return remote;

  return memoryLimited(key, limit, windowMs);
}
