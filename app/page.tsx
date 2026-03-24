import { HomeFeed } from "@/components/home-feed";
import { getStartups } from "@/src/lib/startups";

export const dynamic = "force-dynamic";

export default async function Home() {
  const startups = await getStartups();
  return <HomeFeed startups={startups} />;
}
