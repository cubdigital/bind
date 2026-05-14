"use client";

import dynamic from "next/dynamic";

const LivePoseLazy = dynamic(
  () =>
    import("./live-pose-client").then((m) => ({ default: m.LivePoseClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background pb-24 text-muted-foreground text-sm">
        Loading pose tools…
      </div>
    ),
  },
);

export function LivePoseDynamic() {
  return <LivePoseLazy />;
}
