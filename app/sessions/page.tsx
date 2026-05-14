import { SessionsView } from "@/components/scrum-app/sessions-view";
import { BottomNav } from "@/components/scrum-app/bottom-nav";
import { getStrengthFramework } from "@/lib/scrum/data";

export default function SessionsPage() {
  const fw = getStrengthFramework();

  return (
    <>
      <SessionsView sessions={fw.exampleSessions} />
      <BottomNav />
    </>
  );
}
