import { newSection, type WarmupSection } from "./warmup";

type TemplateSection = { title: string; notes: string; example: string };

export type WarmupTemplate = {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
};

// Starting points for a lift's warm-up. Applying one copies its sections
// (without exercises); after that the user can change anything.
export const WARMUP_TEMPLATES: WarmupTemplate[] = [
  {
    id: "rusin",
    name: "Six-phase warm-up",
    description:
      "Dr John Rusin's structure: soft tissue, dynamic stretching, corrective exercise, activation, pattern prep and CNS. Run it top to bottom in 6 to 10 minutes.",
    sections: [
      {
        title: "Soft tissue work",
        notes: "Foam roll the sore or tight spots you'll be loading today.",
        example: "Foam roll quads",
      },
      {
        title: "Dynamic stretching",
        notes: "Dynamically stretch the areas you just rolled.",
        example: "Leg swings",
      },
      {
        title: "Corrective exercise",
        notes: "Multi-joint mobility work and skill drills.",
        example: "Deep goblet squat hold",
      },
      {
        title: "Muscle activation",
        notes:
          "Bands or bodyweight to wake the target muscles up and build a strong mind-muscle connection.",
        example: "Banded glute bridge",
      },
      {
        title: "Movement pattern prep",
        notes: "Groove the exact patterns you're about to train.",
        example: "Empty bar squats",
      },
      {
        title: "CNS stimulation",
        notes:
          "Quick explosive movements (jumps, fast skips, hops) to switch the nervous system on.",
        example: "Box jumps",
      },
    ],
  },
  {
    id: "own",
    name: "Your own warm-up",
    description:
      "One simple list you fill however you like. Add more sections any time.",
    sections: [{ title: "Warm-up", notes: "", example: "Bike, easy pace" }],
  },
];

export function sectionsFromTemplate(templateId: string): WarmupSection[] {
  const template = WARMUP_TEMPLATES.find((t) => t.id === templateId);
  return (template?.sections ?? []).map((s) => newSection(s.title, s.notes));
}

// Placeholder for the "add exercise" field: the template's example if the
// section still has a template title, otherwise something generic
export function exampleFor(sectionTitle: string): string {
  for (const t of WARMUP_TEMPLATES) {
    const match = t.sections.find((s) => s.title === sectionTitle);
    if (match) return `e.g. ${match.example}`;
  }
  return "Add an exercise";
}
