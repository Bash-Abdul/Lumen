'use client';

export default function Avatar({ src, alt = "avatar", size = 48, className = "" }) {
  const dimension = typeof size === "number" ? size : 48;
  return (
    <div
      className={[
        "rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: dimension, height: dimension }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-sm text-zinc-300">✺</span>
      )}
    </div>
  );
}
