import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-border shadow-sm sm:grid-cols-[1.2fr_1fr]">
        <div className="bg-primary p-10 text-primary-foreground sm:p-14">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Your first conversation is waiting
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/80">
            Join AfriLingua today and start speaking with confidence, one
            lesson at a time.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-8 px-6">
            <Link href="/register">Create your free account</Link>
          </Button>
        </div>

        <div className="hidden bg-accent/15 p-14 sm:flex sm:flex-col sm:justify-center">
          <p className="font-heading text-2xl text-accent italic">
            &ldquo;Karibu.&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Swahili for &ldquo;welcome.&rdquo; It&apos;s the first word most
            of our learners pick up.
          </p>
        </div>
      </div>
    </section>
  );
}
