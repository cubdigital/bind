"use client";

import Link from "next/link";
import { Activity, Smartphone } from "lucide-react";

export function DesktopLiveGate() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24 pt-14 text-center">
      <Smartphone className="mb-6 size-16 text-muted-foreground" aria-hidden />
      <h1 className="font-bold text-2xl text-foreground">Live pose</h1>
      <p className="mt-4 max-w-sm text-muted-foreground text-sm leading-relaxed">
        This view uses your camera and is meant for phones and tablet-sized
        windows. On larger screens use the exercise library tabs—open Bind on a
        device or shrink the viewport below about 768px width to unlock Live here.
      </p>
      <p className="mt-3 max-w-sm text-muted-foreground text-xs leading-relaxed">
        Camera access needs a secure context (HTTPS) in production, except on
        localhost.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
      >
        Back to exercises
      </Link>
    </div>
  );
}

export function HydratingGate() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background pb-24 pt-14">
      <Activity className="size-10 animate-pulse text-primary" aria-hidden />
      <p className="text-muted-foreground text-sm">Preparing Live…</p>
    </div>
  );
}
