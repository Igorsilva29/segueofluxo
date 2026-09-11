import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.svg";

export function Logo({ className = "h-11 sm:h-16" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="SEGUE O FLUXO — página inicial">
        <img
          src={logo}
          alt="Segue o Fluxo"
          className={`w-auto ${className}`}
        />
    </Link>
  );
}
