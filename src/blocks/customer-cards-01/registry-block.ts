// Registry definition for the customer cards block
// This would be added to the main registry-blocks.ts file

export const customerCardsBlock = {
  name: "customer-cards-01",
  author: "DNwerks (https://github.com/dnwerks)",
  title: "Customer Management Cards",
  description: "Customer contact cards with status indicators, contact information display, and action menus. Features responsive grid layout and contact method visualization.",
  type: "registry:block",
  registryDependencies: [
    "card",
    "badge",
    "button",
    "dropdown-menu"
  ],
  dependencies: [
    "lucide-react"
  ],
  files: [
    {
      path: "blocks/customer-cards-01/components/customer-cards.tsx",
      type: "registry:component",
    },
  ],
  categories: ["crm", "dashboard"],
};