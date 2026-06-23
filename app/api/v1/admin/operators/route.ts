import { ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { listOperators, upsertOperator } from "@/lib/data/catalog";
import { operatorInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthed())) return new Response("Unauthorized", { status: 401 });
  return ok(listOperators());
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return new Response("Unauthorized", { status: 401 });
  const parsed = await parseBody(req, operatorInputSchema);
  if ("response" in parsed) return parsed.response;
  return ok(upsertOperator(parsed.data), { status: 201 });
}
