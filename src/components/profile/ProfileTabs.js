'use client';

import Tabs from "../common/Tabs";

const PROFILE_TABS = [
  { key: "photos", label: "Photos" },
  { key: "reposts", label: "Reposts" },
  { key: "blogs", label: "Blogs" },
];

export default function ProfileTabs({ active = "photos", onChange }) {
  return <Tabs tabs={PROFILE_TABS} activeKey={active} onChange={onChange} />;
}
