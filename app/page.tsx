import { HomeFeed } from "@/components/home-feed";
import { getStartups } from "@/src/lib/startups-server";

export const revalidate = 60;

export default async function Home() {
  const startups = await getStartups();
  return <HomeFeed startups={startups} />;
}
