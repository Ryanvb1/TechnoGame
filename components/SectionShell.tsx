import Link from "next/link";

export function SectionShell({
  title,
  children,
  centered = false,
}: {
  title: string;
  children?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <main
      className={`flex min-h-screen flex-col gap-10 px-8 py-12 sm:px-16 ${
        centered ? "items-center text-center" : "items-start"
      }`}
    >
      <Link
        href="/"
        className="group flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neon-dim transition-colors duration-200 hover:text-neon"
      >
        <span
          style={{ clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)" }}
          className="h-4 w-4 bg-neon-dim transition-all duration-200 group-hover:bg-neon group-hover:shadow-[0_0_10px_var(--neon)]"
        />
        Back
      </Link>
      <h1 className="text-4xl font-bold uppercase tracking-widest text-neon sm:text-6xl">
        {title}
      </h1>
      <div className="max-w-2xl text-foreground/80">{children}</div>
    </main>
  );
}
