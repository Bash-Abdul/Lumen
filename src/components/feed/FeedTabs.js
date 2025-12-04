'use client';

import Tabs from "../common/Tabs";
import Button from "../common/Button";

const FEED_TABS = [
  { key: "forYou", label: "For You" },
  { key: "following", label: "Following" },
];

export default function FeedTabs({ active = "forYou", onChange, isAuthenticated }) {
  let display = null;
  if (isAuthenticated){
    display = <Tabs tabs={FEED_TABS} activeKey={active} onChange={onChange} />
  }else {
    display =<div className="flex gap-2"><Button href={'/login'}>Login</Button> <Button href={'/signup'} >Sign Up</Button></div>
  }
  return display;
}
