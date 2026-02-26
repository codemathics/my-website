import { notFound } from "next/navigation";
import { caseStudies, getProjectBySlug } from "@/data/projects";
import CaseStudyPage from "@/components/CaseStudyPage";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.name} — Clement Hugbo`,
    description: project.overview.slice(0, 160),
    openGraph: {
      title: `${project.name} — Clement Hugbo`,
      description: project.overview.slice(0, 160),
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <CaseStudyPage project={project} />;
}
