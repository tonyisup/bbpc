import { StatsPageClient } from "./StatsPageClient";

export default function StatsPage({ params }: { params: { tag: string } }) {
  const { tag } = params;
  return <StatsPageClient tag={tag} />;
}
