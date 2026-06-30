import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "accent" | "primary" | "whatsapp" | "outline";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  accent: "bg-accent text-accent-foreground hover:bg-accent-600",
  primary: "bg-primary text-primary-foreground hover:bg-primary-500",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1da851]",
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
