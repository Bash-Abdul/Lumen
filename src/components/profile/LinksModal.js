export default function LinksModal({ open, onClose, links = [] }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="card p-6 w-full max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Links & socials</h3>
            <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white">
              Close
            </button>
          </div>
  
          {links.length > 0 ? (
            <div className="space-y-3 text-sm">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.label === "Email" ? `mailto:${link.url}` : link.url}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 hover:border-emerald-400 bg-zinc-900/60"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-zinc-400 break-all">{link.url}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No links added yet.</p>
          )}
        </div>
      </div>
    );
  }




  // function LinksModal({ open, onClose, links }) {
  //   if (!open) return null;
  
  //   return (
  //     <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
  //       <div className="card p-6 w-full max-w-md space-y-4">
  //         <div className="flex items-center justify-between">
  //           <h3 className="text-lg font-semibold">Links & socials</h3>
  //           <button
  //             onClick={onClose}
  //             className="text-sm text-zinc-400 hover:text-white"
  //           >
  //             Close
  //           </button>
  //         </div>
  
  //         {links.length > 0 ? (
  //           <div className="space-y-3 text-sm">
  //             {links.map((link) => (
  //               <a
  //                 key={link.label}
  //                 href={link.label === "Email" ? `mailto:${link.url}` : link.url}
  //                 className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 hover:border-emerald-400 bg-zinc-900/60"
  //                 target="_blank"
  //                 rel="noreferrer"
  //               >
  //                 <span>{link.label}</span>
  //                 <span className="text-xs text-zinc-400 break-all">
  //                   {link.url}
  //                 </span>
  //               </a>
  //             ))}
  //           </div>
  //         ) : (
  //           <p className="text-xs text-zinc-500">No links added yet.</p>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }
  