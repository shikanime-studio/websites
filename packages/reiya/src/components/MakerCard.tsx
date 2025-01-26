import NextImage from "next/image";
import MakerBadges from "@/components/MakerBadges";

type MakerCardProps = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  biography: string | null;
  status: string | null;
  badges: string[];
};
export function MakerCard({
  username,
  display_name,
  avatar_url,
  biography,
  status,
  badges,
}: MakerCardProps) {
  return (
    <div className="card image-full h-full w-96 shadow-xl">
      <figure className="relative">
        {avatar_url && (
          <NextImage
            src={avatar_url}
            alt={display_name}
            fill={true}
            sizes="100%"
          />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{display_name}</h2>
        <p>{biography}</p>
        <div className="card-actions justify-end">
          <MakerBadges status={status} badges={badges} />
        </div>
      </div>
    </div>
  );
}
