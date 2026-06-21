// central registry of every experiment. the index grid and the [slug] page
// both read from here. add a day by importing its component + meta and pushing
// an entry. the other built components live under day-0X-* and get re-added
// here as the series ships.

import type { ComponentType } from "react";
import type { ExperimentMeta } from "./shared";

import MagneticDock from "./day-01-magnetic-dock/MagneticDock";
import { meta as magneticDock } from "./day-01-magnetic-dock/meta";

export interface Experiment {
  meta: ExperimentMeta;
  Component: ComponentType;
}

// ordered by day; the grid renders this reversed so the newest shows first.
export const experiments: Experiment[] = [
  { meta: magneticDock, Component: MagneticDock },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.meta.slug === slug);
}

export function getAdjacent(slug: string) {
  const i = experiments.findIndex((e) => e.meta.slug === slug);
  return {
    prev: i > 0 ? experiments[i - 1] : undefined,
    next: i < experiments.length - 1 ? experiments[i + 1] : undefined,
  };
}

export const GITHUB_REPO = "https://github.com/codemathics/my-website";
// the next app lives in the my-website/ subdirectory of the repo, so the blob
// path needs that prefix to resolve on github.
export const githubUrl = (sourcePath: string) =>
  `${GITHUB_REPO}/blob/main/my-website/${sourcePath}`;
