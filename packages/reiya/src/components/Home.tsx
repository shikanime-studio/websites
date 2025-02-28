import { MakerCard } from "../components/MakerCard";

export default function Home() {
  const makers = {
    makers: [
      {
        username: "maker1",
        display_name: "Maker 1",
        biography: "Maker 1 biography",
        avatar_url: "https://via.placeholder.com/150",
        badges: ["badge1", "badge2"],
        status: "active",
      },
      {
        username: "maker2",
        display_name: "Maker 2",
        biography: "Maker 2 biography",
        avatar_url: "https://via.placeholder.com/150",
        badges: ["badge3", "badge4"],
        status: "active",
      },
    ],
  };
  return (
    <>
      <div className="flex flex-wrap justify-center gap-4">
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row">
            <div>
              <h1 className="text-5xl font-bold">
                Connect, Create and Thrive !
              </h1>
              <p className="py-6">
                We{"'"}re all about bringing together costume Makers and cosplay
                enthusiasts! In a world where everything is becoming more
                personalized, our passion-driven Makers and boundless creativity
                make the impossible, well, possible!
              </p>
            </div>
          </div>
        </div>
        {makers.makers.map((maker) => (
          <a
            href={`https://instagram.com/${maker.username}`}
            key={maker.username}
          >
            <MakerCard {...maker} />
          </a>
        ))}
      </div>
    </>
  );
}
