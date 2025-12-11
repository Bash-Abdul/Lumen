// 'use client';

// import { useState } from "react";
// import Button from "../../../components/common/Button";
// import api from "@/lib/api";
// import { useRouter } from "next/navigation";

// export default function CreateBlogPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     title: "",
//     cover: "",
//     tags: "workflow, lighting",
//     content: "",
//     publish: false,
//   });

//   const [statusMessage, setStatusMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (field) => (e) => {
//     const value = e.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatusMessage("Saving...");
//     setError("");
//     setLoading(true);

//     try {
//       const { title, cover, tags, content, publish } = formData;

//       const tagsArray = tags
//         .split(",")
//         .map((t) => t.trim())
//         .filter(Boolean);

//       const res = await api.post("/blog", {
//         title,
//         content,
//         coverUrl: cover || null,
//         tags: tagsArray,
//         status: publish ? "PUBLISHED" : "DRAFT",
//       });

//       const { ok, post, message } = res.data;
//       if (!ok) {
//         throw new Error(message || "Failed to create blog");
//       }

//       setStatusMessage(
//         publish ? "Post published successfully." : "Draft saved successfully."
//       );
//       router.push("/learn");

//       // reset form
//       setFormData({
//         title: "",
//         cover: "",
//         tags: "workflow, lighting",
//         content: "",
//         publish: false,
//       });
//     } catch (err) {
//       console.error("Create blog error", err);
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePublish = () => {
//     setFormData((prev) => ({
//       ...prev,
//       publish: !prev.publish,
//     }));
//   };

//   const { title, cover, tags, content, publish } = formData;

//   return (
//     <div className="space-y-6">
//       <div>
//         <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//           Write
//         </p>
//         <h1 className="text-3xl font-semibold">Create blog post</h1>
//         <p className="text-sm text-zinc-400">
//           Draft a simple story and choose whether to save as draft or publish.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="card p-6 space-y-4">
//         <input
//           value={title}
//           onChange={handleChange("title")}
//           placeholder="Title"
//           required
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />

//         <input
//           value={cover}
//           onChange={handleChange("cover")}
//           placeholder="Cover image URL (optional)"
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />

//         <input
//           value={tags}
//           onChange={handleChange("tags")}
//           placeholder="Tags separated by commas"
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />

//         <textarea
//           value={content}
//           onChange={handleChange("content")}
//           placeholder="Write your story..."
//           rows={8}
//           required
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />

//         <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
//           <div>
//             <p className="text-sm text-zinc-200">Publish toggle</p>
//             <p className="text-xs text-zinc-500">
//               Off = save as draft, On = publish immediately.
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={togglePublish}
//             className={[
//               "relative flex items-center w-16 h-8 rounded-full transition-colors duration-200 border",
//               publish
//                 ? "bg-emerald-500/30 border-emerald-400"
//                 : "bg-zinc-800 border-zinc-700",
//             ].join(" ")}
//           >
//             <span
//               className={[
//                 "absolute left-1 bottom-1 h-6 w-6 rounded-full bg-white transition-transform duration-200",
//                 publish ? "translate-x-8" : "translate-x-0",
//               ].join(" ")}
//             />
//           </button>
//         </div>

//         <Button
//           type="submit"
//           disabled={!title || !content || loading}
//         >
//           {loading
//             ? "Saving..."
//             : publish
//             ? "Publish"
//             : "Save draft"}
//         </Button>

//         {error && (
//           <p className="text-xs text-red-400 mt-2">
//             {error}
//           </p>
//         )}
//         {statusMessage && !error && (
//           <p className="text-xs text-zinc-400 mt-2">
//             {statusMessage}
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import CreateBlogClient from "./CreateBlogClient";
import CreateBlogForm from "./CreateBlogForm";

export default async function NewBlogPage() {
  const user = await getCurrentUser();

  if (!user) {
    // send logged-out users away
    redirect(`/login?next=${encodeURIComponent("/learn/new")}`);
  }

  // return <CreateBlogClient />;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Write
        </p>
        <h1 className="text-3xl font-semibold">Create blog post</h1>
        <p className="text-sm text-zinc-400">
          Draft a simple story and choose whether to save as draft or publish.
        </p>
      </div>

      <CreateBlogForm />
    </div>
  );
}
