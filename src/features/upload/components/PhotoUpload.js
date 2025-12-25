"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
// import { uploadPhotos } from "@/app/actions/post-actions";
import { uploadPhotos } from "@/server/actions/postActions";
import { toast } from "sonner";

export default function PhotoUpload() {
    const router = useRouter();
    const fileInputRef = useRef(null);
  
    const [isPending, startTransition] = useTransition();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
  
    // Cleanup previews on unmount
    useEffect(() => {
      return () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [previews]);
  
    const handleFileSelect = (e) => {
      const files = Array.from(e.target.files || []);
  
      // revoke old previews before replacing
      previews.forEach((url) => URL.revokeObjectURL(url));
  
      if (files.length === 0) {
        setSelectedFiles([]);
        setPreviews([]);
        return;
      }
  
      const validFiles = [];
      const invalidReasons = [];
  
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          invalidReasons.push(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          invalidReasons.push(`${file.name} is bigger than 10MB`);
          continue;
        }
        validFiles.push(file);
      }
  
      setSelectedFiles(validFiles);
      setPreviews(validFiles.map((file) => URL.createObjectURL(file)));
  
      if (invalidReasons.length > 0) {
        toast.error("Some files were skipped", {
          description: invalidReasons.slice(0, 3).join(", "),
        });
      }
  
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file${validFiles.length > 1 ? "s" : ""} selected`);
      } else {
        toast.error("No valid images selected");
      }
    };
  
    const handleRemoveFile = (index) => {
      const newFiles = [...selectedFiles];
      const newPreviews = [...previews];
  
      if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
  
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
  
      setSelectedFiles(newFiles);
      setPreviews(newPreviews);
  
      toast.message("Removed file");
    };
  
    const clearAll = () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.message("Cleared selection");
    };
  
    const openFileDialog = () => fileInputRef.current?.click();
  
    const handleUpload = () => {
      if (selectedFiles.length === 0) {
        toast.error("Please select at least one photo");
        return;
      }
  
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("photos", file));
  
      toast.loading("Uploading photos...", { id: "upload" });
  
      startTransition(async () => {
        const result = await uploadPhotos(formData);
  
        if (result?.error) {
          toast.error(result.error, { id: "upload" });
          return;
        }
  
        if (result?.success) {
          const count = result.count || selectedFiles.length;
  
          toast.success(`Uploaded ${count} photo${count > 1 ? "s" : ""}`, {
            id: "upload",
          });
  
          // clear state
          previews.forEach((url) => URL.revokeObjectURL(url));
          setSelectedFiles([]);
          setPreviews([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
  
          // Go to feed
          router.push("/feed");
          router.refresh();
        } else {
          toast.error("Upload failed", { id: "upload" });
        }
      });
    };
  
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Upload Photos</h2>
          <p className="text-sm text-zinc-400">
            Select multiple photos to upload. Each photo becomes a post.
          </p>
        </div>
  
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
  
        <div
          onClick={openFileDialog}
          className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-medium">Click to select photos</p>
              <p className="text-sm text-zinc-400 mt-1">Multiple files supported</p>
            </div>
            <p className="text-xs text-zinc-500">PNG, JPG, WebP up to 10MB</p>
          </div>
        </div>
  
        {previews.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Selected Photos ({selectedFiles.length})
              </h3>
  
              <Button variant="secondary" onClick={clearAll} disabled={isPending}>
                Clear All
              </Button>
            </div>
  
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={preview} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-zinc-800"
                  />
  
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                  >
                    ×
                  </button>
  
                  {selectedFiles[index] && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {(selectedFiles[index].size / 1024 / 1024).toFixed(2)}MB
                    </div>
                  )}
                </div>
              ))}
            </div>
  
            <div className="flex justify-end mt-6">
              <Button variant="primary" onClick={handleUpload} disabled={isPending}>
                {isPending
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

// export default function PhotoUpload() {
//   const router = useRouter();
//   const fileInputRef = useRef(null);

//   const [isPending, startTransition] = useTransition();
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previews, setPreviews] = useState([]);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   // Cleanup previews on unmount
//   useEffect(() => {
//     return () => {
//       previews.forEach((url) => URL.revokeObjectURL(url));
//     };
//   }, [previews]);

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files || []);

//     // revoke old previews before replacing
//     previews.forEach((url) => URL.revokeObjectURL(url));

//     const validFiles = [];
//     const invalidReasons = [];

//     for (const file of files) {
//       if (!file.type.startsWith("image/")) {
//         setError("Only image files are allowed");
//         continue;
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         setError("File size must be less than 10MB");
//         continue;
//       }
//       validFiles.push(file);
//     }

//     setSelectedFiles(validFiles);
//     // setError(null);

//     const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
//     setPreviews(newPreviews);

//     if (invalidReasons.length > 0) {
//         toast.error("Some files were skipped", {
//           description: invalidReasons.slice(0, 3).join(", "),
//         });
//       }
  
//       if (validFiles.length > 0) {
//         toast.success(`${validFiles.length} file${validFiles.length > 1 ? "s" : ""} selected`);
//       } else {
//         toast.error("No valid images selected");
//       }
//   };

//   const handleUpload = async () => {
//     if (selectedFiles.length === 0) {
//       setError("Please select at least one photo");
//       return;
//     }

//     setError(null);
//     setSuccess(null);

//     const formData = new FormData();
//     selectedFiles.forEach((file) => formData.append("photos", file));

//     startTransition(async () => {
//       const result = await uploadPhotos(formData);

//       if (result?.error) {
//         setError(result.error);
//         return;
//       }

//       if (result?.success) {
//         const count = result.count || selectedFiles.length;
//         setSuccess(`Successfully uploaded ${count} photo${count > 1 ? "s" : ""}!`);

//         // clear state
//         previews.forEach((url) => URL.revokeObjectURL(url));
//         setSelectedFiles([]);
//         setPreviews([]);

//         if (fileInputRef.current) fileInputRef.current.value = "";

//         setTimeout(() => {
//           router.push("/feed");
//         }, 800);
//       }
//     });
//   };

//   const handleRemoveFile = (index) => {
//     const newFiles = [...selectedFiles];
//     const newPreviews = [...previews];

//     if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);

//     newFiles.splice(index, 1);
//     newPreviews.splice(index, 1);

//     setSelectedFiles(newFiles);
//     setPreviews(newPreviews);

//     toast.message("Removed file");
//   };

//   const openFileDialog = () => fileInputRef.current?.click();

//   const clearAll = () => {
//     previews.forEach((url) => URL.revokeObjectURL(url));
//     setSelectedFiles([]);
//     setPreviews([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-semibold mb-2">Upload Photos</h2>
//         <p className="text-sm text-zinc-400">
//           Select multiple photos to upload. Each photo will be posted individually to your feed.
//         </p>
//       </div>

//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         multiple
//         onChange={handleFileSelect}
//         className="hidden"
//       />

//       <div
//         onClick={openFileDialog}
//         className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 transition-colors"
//       >
//         <div className="space-y-4">
//           <div className="text-6xl">📸</div>
//           <div>
//             <p className="text-lg font-medium">Click to select photos</p>
//             <p className="text-sm text-zinc-400 mt-1">
//               Multiple files supported
//             </p>
//           </div>
//           <p className="text-xs text-zinc-500">PNG, JPG, WebP up to 10MB</p>
//         </div>
//       </div>

//       {previews.length > 0 && (
//         <div>
//           <h3 className="text-lg font-medium mb-4">
//             Selected Photos ({selectedFiles.length})
//           </h3>

//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//             {previews.map((preview, index) => (
//               <div key={preview} className="relative group">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={preview}
//                   alt={`Preview ${index + 1}`}
//                   className="w-full h-40 object-cover rounded-lg border border-zinc-800"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => handleRemoveFile(index)}
//                   className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                   aria-label="Remove file"
//                 >
//                   ×
//                 </button>

//                 {selectedFiles[index] && (
//                   <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
//                     {(selectedFiles[index].size / 1024 / 1024).toFixed(2)}MB
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 rounded-lg p-4">
//           {success}
//         </div>
//       )}

//       {selectedFiles.length > 0 && (
//         <div className="flex justify-end gap-4">
//           <Button variant="secondary" onClick={clearAll} disabled={isPending}>
//             Clear All
//           </Button>

//           <Button variant="primary" onClick={handleUpload} disabled={isPending}>
//             {isPending
//               ? "Uploading..."
//               : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? "s" : ""}`}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
