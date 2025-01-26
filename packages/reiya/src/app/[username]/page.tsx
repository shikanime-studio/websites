import NextImage from "next/image";
import { refreshMaker } from "@/lib/utils";
import { get } from "@vercel/edge-config";
import { INSTAGRAM_REFRESHER_KEY, InstagramRefresher } from "@/lib/config";
import MakerBadges from "@/components/MakerBadges";
import { BsInstagram } from "react-icons/bs";
import NextLink from "next/link";
import zod from "zod";

type Props = {
  params: {
    username: string;
  };
};

const schema = zod.object({
  username: zod.string(),
  display_name: zod.string(),
  biography: zod.string(),
  avatar_url: zod.string(),
  badges: zod.array(zod.string()),
  status: zod.string(),
  works: zod.array(
    zod.object({
      id: zod.string(),
      picture_url: zod.string(),
      description: zod.string(),
    }),
  ),
});

const querySchema = zod.object({
  makers: zod.array(schema),
});

const mutationSchema = zod.object({
  update_makers: zod.object({
    returning: zod.array(schema),
  }),
});

async function getMaker(username: string) {
  const url = new URL(
    `${process.env.HASURA_PROJECT_ENDPOINT!}/api/rest/MakersByUsername`,
  );
  url.searchParams.append("username", username);
  const maker = await fetch(url, {
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
    },
  })
    .then((res) => res.json())
    .then((res) => querySchema.parse(res))
    .then((res) => res.makers[0]);
  return maker;
}

type MakerWorkItemProps = {
  pictureUrl: string;
  description: string;
};

function MakerWorkItem({ pictureUrl, description }: MakerWorkItemProps) {
  return (
    <div className="relative h-72 w-72 cursor-pointer">
      <NextImage
        src={pictureUrl}
        className="h-full w-full object-cover"
        alt={description}
        width={288}
        height={288}
      />
    </div>
  );
}

export default async function Maker({ params }: Props) {
  const maker = await getMaker(params.username);
  if (!maker) {
    return (
      <div>
        <div className="m-5 flex w-full flex-col">User not found</div>
      </div>
    );
  }
  return (
    <div>
      <div className="m-5 flex w-full flex-col">
        <div className="w-11/12">
          <div className="flex justify-center gap-10 pb-10">
            {maker.avatar_url ? (
              <NextImage
                src={maker.avatar_url}
                className="avatar rounded-full"
                alt="username"
                width={160}
                height={160}
              />
            ) : (
              <div className="avatar placeholder">
                <div className="-h-40 w-40 rounded-full bg-neutral-focus text-neutral-content">
                  <span className="text-3xl">
                    {maker.display_name.slice(0, 1)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="block text-3xl font-light leading-relaxed">
                  {maker.display_name}
                </h2>
                <NextLink href={`https://instagram.com/${maker.username}`}>
                  <BsInstagram />
                </NextLink>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-base font-bold">{maker.username}</h1>
                <span className="text-base">{maker.biography}</span>
                <MakerBadges status={maker.status} badges={maker.badges} />
              </div>
            </div>
          </div>
          <div className="border-b border-gray-300"></div>
          <article className="mt-5 flex justify-center">
            {maker.works.length !== 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {maker.works.map((work) => (
                  <MakerWorkItem
                    pictureUrl={work.picture_url}
                    description={work.description}
                    key={work.id}
                  />
                ))}
              </div>
            ) : (
              <p>
                This maker hasn{"'"}t released anything, but they{"'"}re
                probably working on something exciting!
              </p>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
