const languages = [
  "Swahili",
  "Yoruba",
  "Kinyarwanda",
  "Amharic",
  "Zulu",
  "Hausa",
  "Igbo",
  "Wolof",
  "Twi",
  "Shona",
];

export function LanguageMarquee() {
  return (
    <section
      id="languages"
      aria-label="Languages available on AfriLingua"
      className="overflow-hidden border-y border-border bg-card py-4"
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {languages.map((language) => (
              <li
                key={language}
                className="flex items-center font-heading text-lg text-muted-foreground"
              >
                {language}
                <span className="mx-6 text-accent">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
