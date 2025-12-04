'use client';

import Tabs from "../common/Tabs";

const FEED_TABS = [
  { key: "forYou", label: "For You" },
  { key: "following", label: "Following" },
];

export default function FeedTabs({ active = "forYou", onChange }) {
  return <Tabs tabs={FEED_TABS} activeKey={active} onChange={onChange} />;
}
