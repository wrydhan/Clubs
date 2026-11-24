/**
 * The portal's section map. One list drives the nav, so a section that exists in
 * the shell and a section somebody can click to are the same thing.
 *
 * Section 2 (funnel + people) is owned by its own track in
 * components/portal/funnel-section.tsx; section 3 (spend + planning) by
 * components/portal/expenses-section.tsx. Each track edits only its own file.
 */
export type PortalSection = {
  id: string;
  label: string;
  owner: string;
};

export const portalSections: PortalSection[] = [
  { id: "reach", label: "Reach → signups", owner: "funnel track" },
  { id: "people", label: "People", owner: "funnel track" },
  { id: "spend", label: "Spend", owner: "expenses track" },
  { id: "planning", label: "What's next", owner: "expenses track" },
];
