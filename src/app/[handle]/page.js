import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";

export default async function PublicProfilePage({ params }) {
  const { handle } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-4">
          <Link href="/" className="text-xl font-semibold">
            Bookmarks
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            @{handle.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">@{handle}</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} public bookmark
            {bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No public bookmarks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium hover:underline">
                    {bookmark.title}
                  </span>
                  <p className="truncate text-sm text-muted-foreground">
                    {bookmark.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
