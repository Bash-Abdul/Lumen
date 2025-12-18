// // features/profile/components/PhotoUploadModal.js
// "use client";

// import PhotoUpload from "@/features/upload/components/PhotoUpload";

// export default function PhotoUploadModal({ open, onClose, redirectTo = "/profile", onDone }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//       {/* overlay */}
//       <div
//         className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* modal */}
//       <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
//           <h3 className="text-lg font-semibold">Upload photos</h3>
//           <button
//             onClick={onClose}
//             className="text-sm text-zinc-400 hover:text-white"
//           >
//             Close
//           </button>
//         </div>

//         <div className="p-5">
//           <PhotoUpload
//             redirectTo={redirectTo}
//             onDone={(result) => {
//               if (onDone) onDone(result);
//               onClose();
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react'

const PhotoUploadModal = () => {
  return (
    <div>PhotoUploadModal</div>
  )
}

export default PhotoUploadModal
