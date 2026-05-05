import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/landing-page" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Agri<span className="text-gradient">Feeds</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#products" className="text-muted-foreground transition hover:text-foreground">Products</a>
          <a href="#testimonials" className="text-muted-foreground transition hover:text-foreground">Reviews</a>
          <a href="#contact" className="text-muted-foreground transition hover:text-foreground">Contact</a>
        </nav>
        <Link to="/admin-login" className="btn-primary text-sm">Admin</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-20 border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} AgriFeeds. All rights reserved.</p>
        <p>Quality feed for every farm.</p>
      </div>
    </footer>
  );
}
