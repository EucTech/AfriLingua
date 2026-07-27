import { cn } from "@/lib/utils";

const features = [
  {
    number: "01",
    title: "AI-matched partners",
    description:
      "Our matching engine pairs you with conversation partners based on fluency level, interests, and schedule instead of a random queue.",
    accent: "bg-primary/10",
  },
  {
    number: "02",
    title: "Live video practice",
    description:
      "Jump into real-time video calls with in-session prompts and gentle corrections powered by AI, so mistakes turn into progress.",
    accent: "bg-accent/15",
  },
  {
    number: "03",
    title: "Structured courses",
    description:
      "Bite-sized lessons built around real conversation, not vocabulary lists. The goal is to get you talking in your first week.",
    accent: "bg-primary/10",
  },
  {
    number: "04",
    title: "Streaks & leaderboards",
    description:
      "Stay motivated with daily streaks, community challenges, and a leaderboard that celebrates showing up, not just scores.",
    accent: "bg-accent/15",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="max-w-md font-heading text-3xl tracking-tight sm:text-4xl">
          Everything you need to speak with confidence
        </h2>

        <div className="mt-16 flex flex-col">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={cn(
                "flex flex-col gap-6 border-t border-border py-10 sm:flex-row sm:items-center sm:gap-12",
                index === features.length - 1 && "border-b"
              )}
            >
              <div
                className={cn(
                  "flex size-16 shrink-0 items-center justify-center rounded-2xl font-heading text-xl text-foreground/70",
                  feature.accent,
                  index % 2 === 1 && "sm:order-last"
                )}
              >
                {feature.number}
              </div>
              <div>
                <h3 className="font-heading text-xl">{feature.title}</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
