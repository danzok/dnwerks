// Registry definition for the campaign cards block
// This would be added to the main registry-blocks.ts file

export const campaignCardsBlock = {
  name: "campaign-cards-01",
  author: "DNwerks (https://github.com/dnwerks)",
  title: "Campaign Management Cards",
  description: "Interactive campaign cards with status tracking, progress indicators, and action menus. Features responsive design, dropdown actions, and delivery rate visualization.",
  type: "registry:block",
  registryDependencies: [
    "card",
    "badge",
    "button", 
    "progress",
    "dropdown-menu"
  ],
  dependencies: [
    "lucide-react"
  ],
  files: [
    {
      path: "blocks/campaign-cards-01/components/campaign-cards.tsx",
      type: "registry:component",
    },
  ],
  categories: ["marketing", "dashboard"],
};