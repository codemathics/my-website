import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { codeToHtml } from "shiki";
import Navbar from "@/components/Navbar";
import {
  experiments,
  getExperiment,
  getAdjacent,
  githubUrl,
} from "@/components/experiments/registry";
import ExperimentView from "./ExperimentView";
import "../experiments.css";

export function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.meta.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperiment(slug);
  if (!exp) return { title: "experiment not found" };
  const title = `${exp.meta.name} - experiments`;
  return {
    title,
    description: exp.meta.description,
    openGraph: { title, description: exp.meta.description },
  };
}

export default async function ExperimentDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = getExperiment(slug);
  if (!exp) notFound();

  const { meta, Component } = exp;
  const { prev, next } = getAdjacent(slug);

  // read at build time only - these pages are SSG (dynamicParams = false), so
  // the source is baked into static HTML and no runtime fs is needed.
  const rawCode = await fs.readFile(
    path.join(/* turbopackIgnore: true */ process.cwd(), meta.sourcePath),
    "utf8",
  );
  const codeHtml = await codeToHtml(rawCode, {
    lang: "tsx",
    theme: "github-dark-default",
  });

  const fileName = meta.sourcePath.split("/").pop() ?? "component.tsx";

  return (
    <div className="exp-page">
      <Navbar showLogo={true} showNav={true} />
      <ExperimentView
        meta={meta}
        fileName={fileName}
        forkUrl={githubUrl(meta.sourcePath)}
        figmaUrl={meta.figmaUrl}
        codeHtml={codeHtml}
        rawCode={rawCode}
        prev={prev?.meta}
        next={next?.meta}
      >
        <Component />
      </ExperimentView>
    </div>
  );
}
