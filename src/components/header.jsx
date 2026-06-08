import Link from "next/link";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function Header({ email }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-semibold">
          Bookmarks
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{email}</span>
          <form action={logout}>
            <Button type="submit" variant="ghost">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
