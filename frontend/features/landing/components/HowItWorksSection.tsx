const steps = [
  {
    title: "Tell us your goals",
    description:
      "Pick the language, your current level, and the topics you actually want to talk about.",
  },
  {
    title: "Get matched instantly",
    description:
      "Our AI finds a compatible practice partner based on your availability and interests.",
  },
  {
    title: "Practice and track progress",
    description:
      "Chat, call, and complete guided lessons while AfriLingua tracks your streaks and fluency.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Get started in three steps
        </h2>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-3 right-0 left-0 hidden h-px bg-border sm:block"
          />
          {steps.map((step, index) => (
            <div key={step.title} className="relative pt-10">
              <span className="absolute top-0 left-0 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="font-heading text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
