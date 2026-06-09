"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookmarkForm } from "@/components/bookmark-form";
import { BookmarkList } from "@/components/bookmark-list";
import {
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from "@/actions/bookmarks";

export function DashboardContent({
  email,
  handle,
  bookmarks: initialBookmarks,
}) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const prevBookmarks = useRef(initialBookmarks);

  // Sync local state when server sends fresh data after mutations
  useEffect(() => {
    if (prevBookmarks.current !== initialBookmarks) {
      setBookmarks(initialBookmarks);
      prevBookmarks.current = initialBookmarks;
    }
  }, [initialBookmarks]);

  async function handleDelete(formData) {
    const result = await deleteBookmark(formData);
    if (!result?.error) {
      const id = formData.get("id");
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  function done() {
    setEditingBookmark(null);
    setShowForm(false);
    router.refresh();
  }

  function handleEdit(bookmark) {
    setEditingBookmark(bookmark);
    setShowForm(true);
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {email} &middot; @{handle}
        </p>
      </div>

      {showForm ? (
        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingBookmark ? "Edit bookmark" : "Add bookmark"}
          </h2>
          <BookmarkForm
            action={editingBookmark ? updateBookmark : createBookmark}
            defaultValues={editingBookmark || {}}
            onDone={done}
          />
        </div>
      ) : (
        <button
          onClick={() => {
            setEditingBookmark(null);
            setShowForm(true);
          }}
          className="mb-6 inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          + Add bookmark
        </button>
      )}

      <BookmarkList
        bookmarks={bookmarks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
