import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Card, Field, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { createAdminSession, verifyCredentials, isAdminAuthed } from "@/lib/auth";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  if (await isAdminAuthed()) redirect(next || "/admin");

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const target = String(formData.get("next") ?? "/admin");
    if (!verifyCredentials(email, password)) {
      redirect(`/admin/login?error=1${target ? `&next=${encodeURIComponent(target)}` : ""}`);
    }
    await createAdminSession(email);
    redirect(target || "/admin");
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Brand subtitle="Admin" size="lg" />
          <p className="mt-2 text-sm text-subtitle">Sign in to manage bookings & inventory</p>
        </div>
        <Card className="p-6">
          <form action={login} className="space-y-4">
            <input type="hidden" name="next" value={next ?? "/admin"} />
            <Field label="Email">
              <Input name="email" type="email" defaultValue="admin@sokasafari.com" required />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" defaultValue="sokasafari" required />
            </Field>
            {error && <p className="text-sm text-danger">Invalid credentials.</p>}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted">
            Demo credentials are pre-filled. Set ADMIN_EMAIL / ADMIN_PASSWORD in .env to change.
          </p>
        </Card>
      </div>
    </div>
  );
}
