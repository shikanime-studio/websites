const PANELS = [
  {
    title: "Track merch",
    body: "Follow characters and artists to hear about new drops first.",
    tone: "from-[#2b1a12] to-[#7a3a1c]",
  },
  {
    title: "Conventions & pop-ups",
    body: "See where the booths will be, before the weekend starts.",
    tone: "from-[#1d2230] to-[#3d4a63]",
  },
  {
    title: "Community wishlists",
    body: "Vote for the pieces you want to see in your region.",
    tone: "from-[#3a1420] to-[#8c2f33]",
  },
];

/** Three quiet panels instead of stock placeholders: the point is the labels,
 *  not the photography. */
export function Hero() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-secondary text-3xl font-semibold tracking-tight md:text-4xl">
        Find your favourite merch at your conventions
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PANELS.map((panel) => (
          <div
            className={`relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${panel.tone} p-6 text-white shadow-sm`}
            key={panel.title}
          >
            <div className="relative z-10 flex flex-col gap-1">
              <h2 className="font-display text-xl font-semibold text-white">
                {panel.title}
              </h2>
              <p className="max-w-[28ch] text-sm text-white/80">
                {panel.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
