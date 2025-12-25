// app/feed/photo/[photoId]/page.js
import { notFound } from "next/navigation";
// import { getPostById } from "@/server/services/feedData";
// import { getPostById } from "@/server/services/feedData";
import { getPostById } from "@/features/feed/services/feedDataService";
import FeedPhotoDetailClient from "./FeedPhotoDetailClient";

export default async function FeedPhotoDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const photoId = resolvedParams.photoId;
  
  const resolvedSearchParams = await searchParams;
  const galleryParam = resolvedSearchParams.gallery;

  const post = await getPostById(photoId);

  if (!post) {
    notFound();
  }

  const galleryIds = galleryParam ? galleryParam.split(',') : [];

  return <FeedPhotoDetailClient post={post} galleryIds={galleryIds} />;
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
    title: `${post.photographerName}'s photo`,
    description: post.caption || `Photo by ${post.photographerName}`,
  };
}