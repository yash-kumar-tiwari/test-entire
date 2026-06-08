import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { DashboardContent } from "./content";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .single();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Header email={user.email} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <DashboardContent
          email={user.email}
          handle={profile?.handle}
          bookmarks={bookmarks || []}
        />
      </main>
    </div>
  );
}
