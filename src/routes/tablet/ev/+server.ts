import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { getStats } from "$lib/server/queries";
import { sse } from "$lib/server/redis";

export async function POST({ url }) {
  if (env.PAGE_KEY && url.searchParams.get("k") !== env.PAGE_KEY)
    throw error(
      404,
      "The page you are looking for does not exist. K incorrect.",
    );

  return sse("main", [
    { event: "stats", data: await getStats() },
    { event: "version", data: env.DEPLOYMENT_ID },
  ]);
}
