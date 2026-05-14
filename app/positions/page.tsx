import { PositionsView } from "@/components/scrum-app/positions-view";
import { BottomNav } from "@/components/scrum-app/bottom-nav";
import { getStrengthFramework } from "@/lib/scrum/data";

export default function PositionsPage() {
  const fw = getStrengthFramework();

  return (
    <>
      <PositionsView positions={fw.positionSpecificRecommendations} />
      <BottomNav />
    </>
  );
}
