import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-semibold">
            Bookmarks
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Save and share your favorite links
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your personal collection of bookmarks. Share them publicly
            or keep them private.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
