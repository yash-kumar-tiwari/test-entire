import { ExternalLink, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarkList({ bookmarks, onEdit, onDelete }) {
  if (bookmarks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No bookmarks yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center gap-3 rounded-lg border p-4"
        >
          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-medium hover:underline"
            >
              {bookmark.title}
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
            </a>
            <p className="truncate text-sm text-muted-foreground">
              {bookmark.url}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {bookmark.is_public ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(bookmark)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <form action={onDelete}>
                <input type="hidden" name="id" value={bookmark.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
