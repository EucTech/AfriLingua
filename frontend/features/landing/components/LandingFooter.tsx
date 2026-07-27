import Link from "next/link";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#languages", label: "Languages" },
];

const company = ["About", "Careers", "Blog"];
const legal = ["Privacy", "Terms"];

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-heading text-xl">
            Afri<span className="text-accent italic">Lingua</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A peer-to-peer language exchange for African languages, guided by
            AI.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Product</p>
          <ul className="mt-4 space-y-3">
            {productLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium">Company</p>
          <ul className="mt-4 space-y-3">
            {company.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium">Legal</p>
          <ul className="mt-4 space-y-3">
            {legal.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AfriLingua. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
