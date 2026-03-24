import { HomeFeed } from "@/components/home-feed";
import { MOCK_STARTUPS } from "@/data/mock-startups";

export default function Home() {
  return <HomeFeed startups={MOCK_STARTUPS} />;
}
