import Link from "next/link";

export default function ImageGrid({ items = [], username }) {

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-zinc-400">No photos yet</p>
      </div>
    );
  }

   // gallery format must match PhotoDetailClient: "id:username"
   const gallery = items.map((i) => `${i.id}:${i.username || username}`).join(",");

   const returnTo = `/${username}`;

   return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
    {items.map((item) => {
      const itemUsername = item.username || username;

      return (
        <Link
          key={item.id}
          href={`/${itemUsername}/media/${item.id}?from=profile&returnTo=${encodeURIComponent(
            returnTo
          )}&gallery=${encodeURIComponent(gallery)}`}
          className="break-inside-avoid block group relative overflow-hidden rounded-lg"
        >
          <img
            src={item.image}
            alt={item.caption || "Photo"}
            className="w-full h-auto object-cover block transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1 text-white">
              <span className="text-sm font-semibold">{item.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-white">
              <span className="text-sm font-semibold">{item.reposts}</span>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
  );
}

//   return (
//     <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
//       {items.map((item) => (
//         <Link
//           key={item.id}
//           // href={`/${username}/media/${item.id}`}
//           href={{
//             pathname: `/${username}/media/${item.id}`,
//             query: { gallery: items.map(i => i.id).join(',') }
//           }}
//           className="break-inside-avoid block group relative overflow-hidden rounded-lg"
//         >
//           <img
//             src={item.image}
//             alt={item.caption}
//             className="w-full h-auto object-cover block transition-transform duration-200 group-hover:scale-105"
//             loading="lazy"
//           />
//           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
//             <div className="flex items-center gap-1 text-white">
//               <svg
//                 className="w-5 h-5"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
//               </svg>
//               <span className="text-sm font-semibold">{item.likes}</span>
//             </div>
//             <div className="flex items-center gap-1 text-white">
//               <svg
//                 className="w-5 h-5"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M19 7h-8l-2-2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7 10l-4-4h3V9h2v4h3l-4 4z" />
//               </svg>
//               <span className="text-sm font-semibold">{item.reposts}</span>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }


  //   return (
  //     <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  //       {items.map((item) => (
  //         <div key={item.id} className="break-inside-avoid">
  //           <img
  //             src={item.image}
  //             alt={item.caption}
  //             className="w-full h-auto object-cover block"
  //             loading="lazy"
  //           />
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  
  // function ImageGrid({ items = [] }) {
  //   return (
  //     <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  //       {items.map((item) => (
  //         <div key={item.id} className="break-inside-avoid">
  //           <img
  //             src={item.image}
  //             alt={item.caption}
  //             className="w-full h-auto object-cover block"
  //             loading="lazy"
  //           />
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }
  