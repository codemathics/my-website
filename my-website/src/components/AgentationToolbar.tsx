"use client";

import dynamic from "next/dynamic";

/* loaded lazily so the toolbar never reaches a production bundle: next inlines
   NODE_ENV, so the guard below is a compile-time constant and the chunk is
   simply never requested. */
const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation),
  { ssr: false }
);

/* visual feedback bridge: click or drag over anything on the page in dev to
   leave an annotation, which syncs to the coding agent through the agentation
   mcp server. */
export default function AgentationToolbar() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
