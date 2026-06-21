import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ExperimentsIndex from "./ExperimentsIndex";
import "./experiments.css";

export const metadata: Metadata = {
  title: "experiments - clement hugbo",
  description:
    "a running series of small, physically-alive interface components, free to fork on github with the figma design for each free in the figma community. drag them, throw them, press them.",
  openGraph: {
    title: "experiments - clement hugbo",
    description:
      "a running series of small, physically-alive interface components, free to fork on github with the figma design for each free in the figma community. drag them, throw them, press them.",
  },
};

export default function ExperimentsPage() {
  return (
    <div className="exp-page">
      <Navbar showLogo={true} showNav={true} />
      <ExperimentsIndex />
    </div>
  );
}
