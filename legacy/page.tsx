import { MakerCard } from "../components/MakerCard";
import NextLink from "next/link";
import zod from "zod";

export const dynamic = "force-dynamic";

const schema = zod.object({
  username: zod.string(),
  display_name: zod.string(),
  biography: zod.string(),
  avatar_url: zod.string(),
  badges: zod.array(zod.string()),
  status: zod.string(),
});

const querySchema = zod.object({
  makers: zod.array(schema),
});

export default async function Home() {
  const makers = await fetch(
    `${process.env.HASURA_PROJECT_ENDPOINT!}/api/rest/Makers`,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
    },
  )
    .then((res) => res.json())
    .then((res) => querySchema.parse(res));
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
          <NextLink
            href={`https://instagram.com/${maker.username}`}
            key={maker.username}
          >
            <MakerCard {...maker} />
          </NextLink>
        ))}
      </div>
    </>
  );
}
