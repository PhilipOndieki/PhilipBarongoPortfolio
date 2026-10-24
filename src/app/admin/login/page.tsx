import { LoginForm } from "@/components/admin/LoginForm";

const LINK_ERROR =
  "That login link did not work. It may have expired, or it opened in a different browser. Send a new link and open it in this browser.";

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="gutter-x">
      <header className="flex h-[var(--header-h)] items-center border-b border-divider text-[15px]">
        Philip Ondieki · Lead Queue
      </header>
      <section className="grid py-24 md:grid-cols-[var(--col-left)_minmax(0,1fr)]">
        <div className="mb-3 text-muted md:mb-0">Login</div>
        <LoginForm initialNote={error === "link" ? LINK_ERROR : ""} />
      </section>
    </main>
  );
}
