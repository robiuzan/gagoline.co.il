import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "accent" | "primary" | "whatsapp" | "outline";
type Size = "md" | "lg";

// focus ring is `primary`, not `accent`: an orange ring on the white page measures 2.56:1 and
// fails WCAG SC 1.4.11, which requires 3:1 of a focus indicator. primary on white is 13.82:1.
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // The accent hover goes LIGHTER, which looks backwards and is the whole point. With the dark
  // foreground (see --color-accent-foreground), navy on accent-600 is 4.05:1 and still FAILS AA;
  // navy on accent-400 is 6.51:1 and passes. Darkening the hover is the intuitive fix and the wrong
  // one. Measured 2026-08-24.
  accent: "bg-accent text-accent-foreground hover:bg-accent-400",
  primary: "bg-primary text-primary-foreground hover:bg-primary-500",
  // Dark text on the WhatsApp green: navy on #25D366 is 6.97:1, white was 1.98:1 — the worst ratio
  // on the site, on the #2 conversion path. Darkening the green does not help (#128C7E with white
  // is still only 4.14:1), so the fix is the foreground, not the fill.
  whatsapp: "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp-600",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type AnchorProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/** Polymorphic button: renders a Next `<Link>` (internal), `<a>` (external/tel/wa) or `<button>`. */
export function Button(props: AnchorProps | ButtonProps) {
  const { variant = "accent", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, href, ...rest } = props;
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
