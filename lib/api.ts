import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ error: message, details: extra }, { status });
}

/** Parse + validate a JSON body, returning a typed value or a 422 response. */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { response: fail("Invalid JSON body", 400) };
  }
  try {
    return { data: schema.parse(raw) };
  } catch (e) {
    if (e instanceof ZodError) {
      return { response: fail("Validation failed", 422, e.flatten()) };
    }
    throw e;
  }
}
