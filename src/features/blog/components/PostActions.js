'use client';

import Link from "next/link";
import Button from "@/shared/ui/Button";
// import { deletePost } from "@/server/actions/blogActions";
import { deletePost } from "../actions/blogActions";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

export default function PostActions({ slug }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {

    if (isPending) return;

    setError("");

    toast("Delete this post?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          startTransition(async () => {
            const result = await deletePost(slug);

            if (result?.error) {
              toast.error(result.error);
              setError(result.error);
            } else {
              toast.success("Post deleted successfully!");
              router.push("/learn/my-posts");
              router.refresh();
            }
          });
        },
      },
      cancel: {
        label: "Cancel",
      },
    });

    // if (!confirm("Are you sure you want to delete this post?")) {
    //   return;
    // }

    // setError("");

    // startTransition(async () => {
    //   const result = await deletePost(slug);

    //   if (result?.error) {
    //     // setError(result.error);
    //     toast.error(result.error);
    //     alert(result.error); // Or use toast
    //   } else {
    //     toast.success("Post deleted successfully!");
    //     // Optional: redirect if on the post page itself
    //     // router.push("/learn/my-posts");
        
    //     // The page will auto-refresh due to revalidatePath
    //     router.refresh();
    //   }
    // });
    
    // try {
    //   const res = await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
    //   if (!res.ok) {
    //     throw new Error(`Failed: ${res.status}`);
    //   }
    //   onDelete?.();
    //   // Fallback: refresh to reflect deletion
    //   if (!onDelete) {
    //     window.location.href = "/learn/my-posts";
    //   }
    // } catch (err) {
    //   alert("Delete failed (mock/placeholder). Wire to DELETE /api/blogs/:slug");
    //   console.error(err);
    // }
  };

  return (
    <div className="flex items-center gap-2">
      {/* {error && <span className="text-xs text-red-400">{error}</span>} */}


      <Button href={`/learn/${slug}/edit`} variant="ghost" size="sm" disabled={isPending}>
        Edit
      </Button>
      <Button onClick={handleDelete} variant="secondary" size="sm" disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
