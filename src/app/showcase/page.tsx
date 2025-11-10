import { ComponentsShowcase } from "@/components/components-showcase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Component Showcase | DNwerks UI Library",
  description: "Live demonstrations of all components in the DNwerks UI library. See how they look and behave in real applications.",
};

export default function ShowcasePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComponentsShowcase />
    </div>
  );
}