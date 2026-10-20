import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="gutter-x">
      <header className="flex h-[var(--header-h)] items-center border-b border-divider text-[15px]">
        Philip Ondieki · Lead Queue
      </header>
      <section className="grid py-24 md:grid-cols-[var(--col-left)_minmax(0,1fr)]">
        <div className="mb-3 text-muted md:mb-0">Login</div>
        <LoginForm />
      </section>
    </main>
  );
}
