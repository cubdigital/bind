import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live pose",
  description:
    "Camera pose overlay with skeleton and joint angles — runs locally in the browser.",
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
