import { ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { listLocations, upsertLocation } from "@/lib/data/catalog";
import { locationInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthed())) return new Response("Unauthorized", { status: 401 });
  return ok(listLocations());
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new Response("Unauthorized", { status: 401 });
  const parsed = await parseBody(req, locationInputSchema);
  if ("response" in parsed) return parsed.response;
  return ok(upsertLocation(parsed.data), { status: 201 });
}
