export function Mark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={`pulse-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="pulse-grad" x1="8" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.45" stopColor="#a855f7" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#pulse-grad)" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="white" strokeWidth="3" opacity="0.9" />
      <circle className="pulse-core" cx="32" cy="32" r="5" fill="white" />
      <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const GLYPHS: Record<string, { color: string; letter: string }> = {
  openai: { color: "#10b981", letter: "O" },
  anthropic: { color: "#fb7185", letter: "A" },
  huggingface: { color: "#fbbf24", letter: "H" },
  hackernews: { color: "#fb923c", letter: "Y" },
};

export function SourceGlyph({ id, size = "h-11 w-11 text-lg" }: { id: string; size?: string }) {
  const glyph = GLYPHS[id] ?? { color: "#22d3ee", letter: "P" };
  return (
    <span
      className={`grid ${size} place-items-center rounded-2xl font-black text-white shadow-lg shadow-black/30`}
      style={{ background: `linear-gradient(145deg, white, ${glyph.color} 42%)`, color: "#1a1020" }}
    >
      {glyph.letter}
    </span>
  );
}

const RAIL = ["openai", "anthropic", "huggingface", "hackernews"] as const;
const RAIL_NAME: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  huggingface: "Hugging Face",
  hackernews: "Hacker News",
};

export function SourceRail() {
  const loop = [...RAIL, ...RAIL];
  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-white/5 py-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max items-center" style={{ animation: "slide 22s linear infinite" }}>
        {[...loop, ...loop].map((id, index) => (
          <span key={`${id}-${index}`} className="inline-flex items-center gap-2 px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
            <SourceGlyph id={id} size="h-7 w-7 text-xs" />
            {RAIL_NAME[id]}
          </span>
        ))}
      </div>
    </div>
  );
}
