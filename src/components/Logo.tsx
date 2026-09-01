import { Link } from "@tanstack/react-router";

export function Logo({ className = "text-lg sm:text-xl" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="SEGUE O FLUXO — página inicial"
      className={`font-display font-bold tracking-tight leading-none whitespace-nowrap ${className}`}
    >
      <span className="text-ink">SEGUE</span> <span className="text-mint">O</span>{" "}
      <span className="text-ink">FLUXO</span>
    </Link>
  );
}
