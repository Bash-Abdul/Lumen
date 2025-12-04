'use client';

export default function Tabs({ tabs = [], activeKey, onChange }) {
  return (
    <div className="flex gap-2 bg-zinc-900/60 border border-zinc-800 rounded-full p-1 w-max">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange?.(tab.key)}
          className={[
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            activeKey === tab.key
              ? "bg-emerald-400 text-black shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)]"
              : "text-zinc-300 hover:text-white",
          ].join(" ")}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
