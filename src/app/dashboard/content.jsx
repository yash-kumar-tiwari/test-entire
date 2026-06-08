"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkForm } from "@/components/bookmark-form";
import { BookmarkList } from "@/components/bookmark-list";
import { createBookmark, updateBookmark, deleteBookmark } from "@/actions/bookmarks";

export function DashboardContent({ email, handle, bookmarks: initialBookmarks }) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(formData) {
    const result = await deleteBookmark(formData);
    if (!result?.error) {
      const id = formData.get("id");
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  async function handleUpdate(formData) {
    const result = await updateBookmark(formData);
    if (!result?.error) {
      setEditingBookmark(null);
      setShowForm(false);
      router.refresh();
    }
    return result;
  }

  async function handleCreate(formData) {
    const result = await createBookmark(formData);
    if (!result?.error) {
      setShowForm(false);
      router.refresh();
    }
    return result;
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
            action={editingBookmark ? handleUpdate : handleCreate}
            defaultValues={editingBookmark || {}}
            onDone={() => {
              setEditingBookmark(null);
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => {
            setEditingBookmark(null);
            setShowForm(true);
          }}
          className="mb-6 inline-flex items-center justify-center rounded-md border border-dashed px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer"
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
