import { fail, ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { deleteLocation, upsertLocation } from "@/lib/data/catalog";
import { locationInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { id } = await params;
  const parsed = await parseBody(req, locationInputSchema);
  if ("response" in parsed) return parsed.response;
  return ok(upsertLocation({ ...parsed.data, id }));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { id } = await params;
  return deleteLocation(id) ? ok({ deleted: id }) : fail("Location not found", 404);
}
