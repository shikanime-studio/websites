type MakerStatusBadgeProps = {
  status: string | null;
};

function MakerStatusBadge({ status }: MakerStatusBadgeProps) {
  if (status === "COMMISSIONS_CLOSED") {
    return <div className="badge badge-error">Closed</div>;
  } else if (status === "COMMISSIONS_OPEN") {
    return <div className="badge badge-success">Open</div>;
  } else if (status === "COMMISSIONS_WAITLIST") {
    return <div className="badge badge-warning">Waitlist</div>;
  }
  return <div className="badge badge-warning">Unknown</div>;
}

type Props = {
  status: string | null;
  badges: string[];
};

export default function MakerBadges({ status, badges }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <MakerStatusBadge status={status} />
      {badges?.map((badge) => (
        <div className="badge" key={badge}>
          {badge}
        </div>
      ))}
    </div>
  );
}
