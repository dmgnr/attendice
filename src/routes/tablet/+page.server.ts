// src/routes/protected-page/+page.server.ts
import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ url }) => {
  if (env.PAGE_KEY && url.searchParams.get("k") !== env.PAGE_KEY)
    throw error(
      404,
      "The page you are looking for does not exist. K incorrect.",
    );
};
