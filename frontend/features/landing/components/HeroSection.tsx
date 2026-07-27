import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="h-px w-8 bg-accent" />A language exchange, not
            another app
          </p>

          <h1 className="mt-6 font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl md:text-6xl">
            Learn Swahili by
            <br />
            <span className="text-primary italic">actually speaking it</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            AfriLingua pairs you with real speakers of Swahili, Yoruba,
            Kinyarwanda, and Amharic. Skip the flashcards and just talk, with
            AI stepping in when you need a hand.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Button size="lg" asChild className="px-6">
              <Link href="/register">Start learning free</Link>
            </Button>
            <a
              href="#how-it-works"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              See how it works ↓
            </a>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 rounded-3xl bg-accent/10"
          />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">Amara · Lagos, Nigeria</p>
                  <p className="text-xs text-muted-foreground">
                    Matched 2 minutes ago
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Yoruba ↔ English</Badge>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm">
                Ẹ káàrọ̀! Ready for today&apos;s session?
              </div>
              <div className="self-end max-w-[85%] rounded-xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                Good morning! Yes, let&apos;s go over greetings again
              </div>
              <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm">
                <span className="italic">AI tip:</span> try &ldquo;Ẹ káàrọ̀&rdquo;
                back. It means the same thing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
