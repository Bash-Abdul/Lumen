'use client';

import Link from "next/link";

const variants = {
  primary:
    "bg-gradient-to-r from-emerald-500 to-blue-500 text-black hover:opacity-90",
  secondary:
    "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:border-zinc-500",
  ghost: "bg-transparent text-zinc-200 hover:bg-zinc-800 border border-transparent",
  outline:
    "bg-transparent text-zinc-100 border border-zinc-700 hover:border-emerald-400",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  as: Component = "button",
  ...props
}) {
  const composed = [
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={composed} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={composed} {...props}>
      {children}
    </Component>
  );
}
