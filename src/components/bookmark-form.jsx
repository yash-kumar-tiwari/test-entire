"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookmarkSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function BookmarkForm({ action, defaultValues = {}, onDone }) {
  const [serverError, setServerError] = useState(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookmarkSchema),
    values: {
      title: defaultValues.title || "",
      url: defaultValues.url || "",
      is_public: defaultValues.is_public ?? false,
    },
  });

  const isPublic = watch("is_public");

  async function onSubmit(data) {
    setPending(true);
    setServerError(null);

    const formData = new FormData();
    if (defaultValues.id) {
      formData.append("id", defaultValues.id);
    }
    formData.append("title", data.title);
    formData.append("url", data.url);
    formData.append("is_public", String(data.is_public));

    const result = await action(formData);

    if (result?.error) {
      setServerError(result.error._form?.[0] || "Something went wrong");
      setPending(false);
    } else {
      onDone?.();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="My bookmark"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          {...register("url")}
          placeholder="https://example.com"
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="is_public"
          checked={isPublic}
          onCheckedChange={(v) => setValue("is_public", v)}
        />
        <Label htmlFor="is_public">
          {isPublic ? "Public" : "Private"}
        </Label>
      </div>
      <input type="hidden" name="is_public" value={isPublic} />
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : defaultValues.id
              ? "Update bookmark"
              : "Add bookmark"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
