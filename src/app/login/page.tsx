import { BarbellIcon } from "@/components/icons";
import { login } from "./actions";

const errors: Record<string, string> = {
  wrong: "That password isn't right. Try again.",
  config: "The server is missing APP_PASSWORD or SESSION_SECRET — set them in Vercel and redeploy.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? errors[error] ?? errors.wrong : null;

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-6">
        <div className="mb-6 flex items-center gap-2 font-semibold">
          <BarbellIcon className="text-accent" />
          Powerlifting Notebook
        </div>
        <form action={login} className="flex flex-col gap-3">
          <label htmlFor="password" className="text-sm text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="rounded-md border border-hairline bg-background px-3 py-2.5 text-base outline-none transition-[border-color] duration-150 ease-out focus:border-accent"
          />
          {message && (
            <p role="alert" className="text-sm text-accent">
              {message}
            </p>
          )}
          <button
            type="submit"
            className="mt-1 rounded-md bg-foreground py-2.5 font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:opacity-70"
          >
            Unlock
          </button>
        </form>
      </div>
    </main>
  );
}
