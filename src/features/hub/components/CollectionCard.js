'use client';

export default function CollectionCard({ collection }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-48 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.cover}
          alt={collection.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">{collection.title}</h3>
        <p className="text-sm text-zinc-300 line-clamp-2">
          {collection.description}
        </p>
        <p className="text-xs text-zinc-500">
          {collection.count} photos · featured: {collection.featured}
        </p>
      </div>
    </div>
  );
}
