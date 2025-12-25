// app/[username]/media/[photoId]/page.js
import { notFound } from "next/navigation";
import { getPostById } from "@/features/feed/services/feedDataService";
import PhotoDetailClient from "./PhotoDetailClient";

export default async function PhotoDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const photoId = resolvedParams.photoId;

  const from = resolvedSearchParams.from || null;
  const galleryParam = resolvedSearchParams.gallery || "";
  const returnTo = resolvedSearchParams.returnTo || null;

  const post = await getPostById(photoId);

  if (!post) {
    notFound();
  }


  // Parse gallery IDs from query string
  //  const galleryData = galleryParam ? galleryParam.split(',') : [];
  const galleryData = galleryParam ? galleryParam.split(",").filter(Boolean) : [];

  return <PhotoDetailClient
    post={post}
    galleryData={galleryData}
    from={from}
    returnTo={returnTo}
  />
  // <PhotoDetailClient post={post} galleryData={galleryData} origin={origin} />;
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