import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { createFileRoute, Link, notFound  } from "@tanstack/react-router";
import { Camera, Images, MapPin } from "../components/icons";
import { getPublicProfile } from "../lib/server";
import { formatShootingDate } from "../lib/sharing";

export const Route = createFileRoute("/$photographer")({
  loader: async ({ params }: { params: { photographer: string } }) => {
    const profile = await getPublicProfile({
      data: params.photographer,
    });
    if (!profile) {
      throw notFound();
    }
    return profile;
  },
  component: PhotographerProfilePage,
});

interface PublicProfileView {
  name: string;
  image: string | null;
  headline: string;
  bio: string;
  location: string;
  instagram: string;
  links: Array<{ label: string; url: string }>;
  acceptRequests: boolean;
  plans: Array<{
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    timezone: string;
    locationName: string;
    status: string;
  }>;
  past: Array<{
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    locationName: string;
    photoCount: number;
  }>;
}

const WWW_PREFIX = /^www\./;

function PhotographerProfilePage() {
  const profile = Route.useLoaderData() as PublicProfileView;
  return (
    <div className="hk-shell max-w-2xl py-10 md:py-14">
      <header className="flex flex-col items-center gap-4 text-center">
        {profile.image ? (
          <img
            alt={profile.name}
            className="border-hairline size-20 rounded-full border object-cover"
            src={profile.image}
          />
        ) : (
          <span className="bg-accent text-on-accent flex size-20 items-center justify-center rounded-full text-2xl font-black">
            {profile.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="hk-display text-[clamp(1.8rem,5vw,2.6rem)]">
            {profile.name}
          </h1>
          {profile.headline ? (
            <p className="text-ink-soft mt-1 text-[13.5px]">{profile.headline}</p>
          ) : null}
          {profile.location ? (
            <p className="text-ink-soft mt-1.5 flex items-center justify-center gap-1.5 text-[12px]">
              <MapPin size={13} /> {profile.location}
            </p>
          ) : null}
        </div>
        {profile.bio ? (
          <p className="text-ink-soft max-w-md text-[13px] leading-relaxed">
            {profile.bio}
          </p>
        ) : null}
        {profile.acceptRequests ? (
          <Link
            className="mt-1"
            search={{}}
            to="/commissions/new"
          >
            <Button label="Request a shoot" size="md" variant="primary" />
          </Link>
        ) : (
          <p className="text-ink-faint text-[12px]">
            Not taking requests right now.
          </p>
        )}
      </header>

      {profile.links.length > 0 ? (
        <section className="mt-8 flex flex-col gap-2.5">
          {profile.links.map((link: { label: string; url: string }) => (
            <a
              className="border-hairline bg-body hover:bg-[var(--hk-surface-muted)] focus-visible:ring-accent/40 flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              href={link.url}
              key={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="text-ink text-[13.5px] font-semibold">
                {link.label}
              </span>
              <span className="text-ink-faint text-[11px]">
                {new URL(link.url).hostname.replace(WWW_PREFIX, "")}
              </span>
            </a>
          ))}
        </section>
      ) : null}

      {profile.plans.length > 0 ? (
        <ProfileSection eyebrow="Upcoming shoots">
          {profile.plans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </ProfileSection>
      ) : null}

      {profile.past.length > 0 ? (
        <ProfileSection eyebrow="Recent work">
          {profile.past.map((item) => (
            <PastRow item={item} key={item.id} />
          ))}
        </ProfileSection>
      ) : null}
    </div>
  );
}

function ProfileSection({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow: string;
}) {
  return (
    <section className="mt-10">
      <p className="hk-eyebrow mb-3">{eyebrow}</p>
      <Card padding={0} className="overflow-hidden">
        <div className="divide-y divide-[var(--hk-hairline,#e7e0d6)]">
          {children}
        </div>
      </Card>
    </section>
  );
}

function PlanRow({
  plan,
}: {
  plan: {
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    timezone: string;
    locationName: string;
    status: string;
  };
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className="text-accent flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--hk-surface-muted, #f5efe7)" }}
      >
        <Camera size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-[13px] font-semibold">
          {plan.title}
        </p>
        <p className="text-ink-soft truncate text-[11.5px]">
          {[plan.characterName, formatShootingDate(plan.shootingDate, plan.timezone)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <StatusTag status={plan.status} />
    </div>
  );
}

function PastRow({
  item,
}: {
  item: {
    id: number;
    title: string;
    characterName: string;
    shootingDate: string | null;
    locationName: string;
    photoCount: number;
  };
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className="text-ink-soft flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--hk-surface-muted, #f5efe7)" }}
      >
        <Images size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-[13px] font-semibold">
          {item.title}
        </p>
        <p className="text-ink-soft truncate text-[11.5px]">
          {[item.locationName, `${item.photoCount} photos`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {item.shootingDate ? (
        <span className="text-ink-faint hidden shrink-0 text-[11px] sm:block">
          {item.shootingDate.slice(0, 10)}
        </span>
      ) : null}
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  return (
    <span className="hk-eyebrow shrink-0 rounded-full border border-[var(--hk-hairline,#e7e0d6)] px-2.5 py-1 text-[10px]">
      {status}
    </span>
  );
}
