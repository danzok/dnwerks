import { ComponentsList } from "@/components/components-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Components | DNwerks UI Library",
  description: "Here you can find all the components available in the library. We are working on adding more components.",
};

export default function ComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComponentsList />
    </div>
  );
}