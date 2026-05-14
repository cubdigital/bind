import { PrinciplesView } from "@/components/scrum-app/principles-view";
import { BottomNav } from "@/components/scrum-app/bottom-nav";
import { getStrengthFramework } from "@/lib/scrum/data";

export default function PrinciplesPage() {
  const fw = getStrengthFramework();

  return (
    <>
      <PrinciplesView
        principles={fw.coachingPrinciples}
        advancedMethods={fw.advancedMethods}
      />
      <BottomNav />
    </>
  );
}
