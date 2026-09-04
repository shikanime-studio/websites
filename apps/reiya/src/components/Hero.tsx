export function Hero() {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-secondary text-3xl font-black tracking-tight md:text-4xl">
          Find your favorite merch at your conventions
        </h1>
      </div>

      {/* Banners Grid */}
      <div className="grid h-48 grid-cols-1 gap-4 md:h-64 md:grid-cols-3">
        <div className="group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-3xl bg-neutral p-8 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('https://placehold.co/800x600/3c283e/FFF?text=Merch')] bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105" />
          <div className="relative z-10">
            <h2 className="mb-2 text-2xl font-bold">Track Merch</h2>
            <p className="text-sm opacity-90">
              Follow characters and artists to get notified about new drops.
            </p>
          </div>
        </div>

        <div className="group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-3xl bg-[#5c2e2e] p-8 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('https://placehold.co/800x600/5c2e2e/7f3f3f?text=Conventions')] bg-cover bg-center opacity-60 transition duration-500 group-hover:scale-105" />
          <div className="relative z-10">
            <h2 className="mb-2 text-2xl font-bold">Conventions & Popups</h2>
            <p className="text-sm opacity-90">
              Discover where to find exclusive merch near you.
            </p>
          </div>
        </div>

        <div className="bg-accent text-on-accent group relative hidden cursor-pointer flex-col justify-end overflow-hidden rounded-3xl p-8 shadow-lg md:flex">
          <div className="absolute inset-0 bg-[url('https://placehold.co/800x600/ed2533/FFF?text=Community')] bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105" />
          <div className="relative z-10">
            <h2 className="mb-2 text-2xl font-bold">Community Wishlists</h2>
            <p className="text-sm opacity-90">
              Vote for the merch you want to see available in your region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
