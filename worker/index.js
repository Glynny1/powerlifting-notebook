// Cloudflare Worker for powerliftingnotebook.com. Static files in website/ are
// served directly; this script only sees requests that don't match a file.
//
// GET /api/opl/<username> relays an OpenPowerlifting lifter CSV.
// openpowerlifting.org doesn't allow cross-site requests, so the web version of
// the app can't fetch it directly (phones can). Cached at the edge for a day.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default {
  /** @param {Request} request @param {{ ASSETS: { fetch: (r: Request) => Promise<Response> } }} env */
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/opl\/([a-z0-9._-]{1,64})$/i);
    if (!match) return env.ASSETS.fetch(request);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: CORS });
    }

    const username = match[1].toLowerCase();
    let upstream;
    try {
      upstream = await fetch(
        `https://www.openpowerlifting.org/api/liftercsv/${encodeURIComponent(username)}`,
        {
          cf: {
            cacheEverything: true,
            cacheTtlByStatus: { "200-299": 86400, "404": 3600, "500-599": 0 },
          },
        }
      );
    } catch {
      return new Response("OpenPowerlifting is unreachable", { status: 502, headers: CORS });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...CORS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};
