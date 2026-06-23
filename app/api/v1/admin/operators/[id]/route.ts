import { fail, ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { deleteOperator, upsertOperator } from "@/lib/data/catalog";
import { operatorInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { id } = await params;
  const parsed = await parseBody(req, operatorInputSchema);
  if ("response" in parsed) return parsed.response;
  return ok(upsertOperator({ ...parsed.data, id }));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { id } = await params;
  return deleteOperator(id) ? ok({ deleted: id }) : fail("Operator not found", 404);
}
