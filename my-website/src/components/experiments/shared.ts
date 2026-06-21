// shared building blocks for every experiment.
// physics first - these springs are the house style. tune them per piece if needed.

import type { Transition } from "framer-motion";

/** snappy spring - default for most interactions. */
export const SPRING: Transition = { type: "spring", stiffness: 380, damping: 28 };

/** elastic spring - overshoots noticeably, settles slow. for rubber-band feels. */
export const ELASTIC_SPRING: Transition = { type: "spring", stiffness: 300, damping: 14 };

export type Aesthetic = "physics" | "typography" | "glass" | "brutalist" | "synthesis";

export interface ExperimentMeta {
  /** url segment - /experiments/[slug] */
  slug: string;
  /** day number in the 100-day run */
  day: number;
  /** lowercase display name */
  name: string;
  /** one line on what the interaction does */
  description: string;
  /** which aesthetic week it belongs to */
  aesthetic: Aesthetic;
  /** accent colour for this piece */
  accent: string;
  /** path from repo root - used for the on-page code read and the github fork link */
  sourcePath: string;
  /** figma community link where people can grab the design. omitted until published */
  figmaUrl?: string;
}
