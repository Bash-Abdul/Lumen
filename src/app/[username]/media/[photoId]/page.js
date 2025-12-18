// app/[username]/media/[photoId]/page.js
import { notFound } from "next/navigation";
// import { getPostById } from "@/server/services/feed";
import { getPostById } from "@/server/services/feedData";
import PhotoDetailClient from "./PhotoDetailClient";

export default async function PhotoDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const photoId = resolvedParams.photoId;

  const resolvedSearchParams = await searchParams;
  const galleryParam = resolvedSearchParams.gallery;

  const post = await getPostById(photoId);

  if (!post) {
    notFound();
  }


   // Parse gallery IDs from query string
   const galleryIds = galleryParam ? galleryParam.split(',') : [];

  return <PhotoDetailClient post={post} galleryIds={galleryIds} />;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.photoId);

  if (!post) {
    return {
      title: "Photo not found",
    };
  }

  return {
    title: `${post.photographerName} on Instagram`,
    description: post.caption || `Photo by ${post.photographerName}`,
  };
}