// app/[username]/page.js
import { notFound } from "next/navigation";
// import { getProfileByUsername } from "@/server/services/profile";
import { getProfileByUsername } from "@/features/profile/services/profileService";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  return <ProfileClient initialProfile={profile} />;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const profile = await getProfileByUsername(resolvedParams.username);

  if (!profile) {
    return {
      title: "User not found",
    };
  }

  return {
    title: `${profile.name} (@${profile.username})`,
    description: profile.bio || `View ${profile.name}'s profile`,
  };
}