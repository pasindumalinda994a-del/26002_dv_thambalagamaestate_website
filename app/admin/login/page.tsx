import { LoginForm } from "@/app/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <p className="font-secondary text-[11px] font-medium uppercase tracking-[0.2em] text-forest-green/50">
          Thambalagama Estate
        </p>
        <h1 className="mt-3 font-primary text-[clamp(28px,5vw,40px)] text-forest-green">
          Owner login
        </h1>
        <p className="mt-2 font-secondary text-sm text-forest-green/60">
          Enter the shared password to review booking requests.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
