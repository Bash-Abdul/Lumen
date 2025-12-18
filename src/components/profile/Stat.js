export default function Stat({ label, value }) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="text-xs uppercase text-zinc-500 tracking-wide">{label}</p>
        <p className="text-lg font-semibold">{value ?? 0}</p>
      </div>
    );
  }

  
//   function Stat({ label, value }) {
//     return (
//       <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
//         <p className="text-xs uppercase text-zinc-500 tracking-wide">{label}</p>
//         <p className="text-lg font-semibold">{value ?? 0}</p>
//       </div>
//     );
//   }