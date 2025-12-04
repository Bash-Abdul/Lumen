'use client';

export default function BlogContent({ post }) {
  return (
    <article className="card overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.cover}
        alt={post.title}
        className="w-full h-72 object-cover"
        loading="lazy"
      />
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-zinc-400">
            By {post.author?.name} · {post.published}
          </p>
          <h1 className="text-3xl font-semibold mt-2">{post.title}</h1>
        </div>
        <div className="space-y-4 text-zinc-200 leading-relaxed">
          {post.content?.split("\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
