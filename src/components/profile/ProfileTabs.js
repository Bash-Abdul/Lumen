'use client';

import Tabs from "../common/Tabs";

const DEFAULT_TABS = [
  { key: "photos", label: "Photos" },
  { key: "reposts", label: "Reposts" },
  { key: "blogs", label: "Blogs" },
];

export default function ProfileTabs({ active = "photos", onChange, tabs = DEFAULT_TABS }) {
  return <Tabs tabs={tabs} activeKey={active} onChange={onChange} />;
}
