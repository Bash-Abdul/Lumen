import Stat from "./Stat";

export default function StatsModal({ open, onClose, stats }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile stats</h3>
          <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white">
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Photos" value={stats.photos} />
          <Stat label="Reposts" value={stats.reposts} />
          <Stat label="Likes" value={stats.likes} />
          <Stat label="Reposts gained" value={stats.repostsCount} />
          <Stat label="Followers" value={stats.followers} />
          <Stat label="Following" value={stats.following} />
        </div>

        <p className="text-xs text-zinc-500">
          Mock metrics from local data. Wire to real analytics later.
        </p>
      </div>
    </div>
  );
}


// function StatsModal({ open, onClose, stats }) {
//     if (!open) return null;
  
//     return (
//       <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
//         <div className="card p-6 w-full max-w-md space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold">Profile stats</h3>
//             <button
//               onClick={onClose}
//               className="text-sm text-zinc-400 hover:text-white"
//             >
//               Close
//             </button>
//           </div>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <Stat label="Photos" value={stats.photos} />
//             <Stat label="Reposts" value={stats.reposts} />
//             <Stat label="Likes" value={stats.likes} />
//             <Stat label="Reposts gained" value={stats.repostsCount} />
//             <Stat label="Followers" value={stats.followers} />
//             <Stat label="Following" value={stats.following} />
//           </div>
//           <p className="text-xs text-zinc-500">
//             Mock metrics from local data. Wire to real analytics later.
//           </p>
//         </div>
//       </div>
//     );
//   }
  