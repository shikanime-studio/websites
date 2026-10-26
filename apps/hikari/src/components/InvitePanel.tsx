import type { InviteLink } from "../lib/types";
import type { CommissionRole } from "../schema";
import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useToast } from "@astryxdesign/core/Toast";
import { Effect } from "effect";
import { useState } from "react";
import { createInvite, revokeInvite } from "../lib/api";
import {
  COMMISSION_ROLES,
  inviteUrl,
  isInviteUsable,
  ROLE_LABELS,
} from "../lib/cast";
import { Check, Plus } from "./icons";

const DAY_OPTIONS = [
  { label: "No expiry", value: "0" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
];

/**
 * Invitations are links, not account lookups. Pick a role, get a URL, send it
 * however you like; the link is the capability and it can be revoked.
 */
export function InvitePanel({
  commissionId,
  shareToken,
  invites,
  onChanged,
}: {
  commissionId: number;
  shareToken: string;
  invites: InviteLink[];
  onChanged: () => void;
}) {
  const toast = useToast();
  const [role, setRole] = useState<CommissionRole>("cosplayer");
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const active = invites.filter((invite) => isInviteUsable(invite));

  function copy(invite: InviteLink) {
    const url = `${window.location.origin}${inviteUrl(shareToken, invite.token)}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(invite.id);
      window.setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    });
  }

  function create() {
    setBusy(true);
    void Effect.runPromiseExit(
      createInvite({
        commissionId,
        role,
        label,
        days: Number(days),
      }),
    ).then((exit) => {
      setBusy(false);
      if (exit._tag === "Failure") {
        toast({ body: "Could not create the link", type: "error" });
        return;
      }
      setLabel("");
      onChanged();
    });
  }

  function revoke(invite: InviteLink) {
    void Effect.runPromiseExit(revokeInvite(commissionId, invite.id)).then(
      (exit) => {
        if (exit._tag === "Failure") {
          toast({ body: "Could not revoke the link", type: "error" });
          return;
        }
        onChanged();
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-secondary text-[12px] leading-relaxed">
        Send the link to a photographer, cosplayer or assistant. Opening it
        signs them in through the studio account and puts them on the cast with
        the role you picked — no username lookup.
      </p>

      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_130px_auto]">
        <Selector
          label="Role"
          onChange={(value) => {
            setRole(value as CommissionRole);
          }}
          options={COMMISSION_ROLES.map((item) => ({
            label: ROLE_LABELS[item],
            value: item,
          }))}
          size="sm"
          value={role}
        />
        <TextInput
          label="Note (optional)"
          onChange={setLabel}
          placeholder="Make-up artist"
          size="sm"
          value={label}
        />
        <Selector
          label="Expires"
          onChange={setDays}
          options={DAY_OPTIONS}
          size="sm"
          value={days}
        />
        <div className="flex items-end">
          <Button
            icon={<Plus />}
            isLoading={busy}
            label="Create link"
            onClick={create}
            size="sm"
            variant="primary"
          />
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-secondary/70 text-[11.5px]">
          No active links. Anyone with the recap URL can still view the shoot,
          but only a link created here adds them to the cast.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((invite) => (
            <li
              className="border-border flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
              key={String(invite.id)}
            >
              <span className="bg-accent-muted text-accent rounded-full px-2 py-0.5 text-[10.5px] font-semibold">
                {ROLE_LABELS[invite.role]}
              </span>
              <span className="text-primary min-w-0 flex-1 truncate text-[12px]">
                {invite.label || inviteUrl(shareToken, invite.token)}
              </span>
              <span className="text-secondary/70 text-[10.5px]">
                {invite.expiresAt
                  ? `until ${new Date(invite.expiresAt).toLocaleDateString("en-GB")}`
                  : "no expiry"}
              </span>
              <Button
                icon={copiedId === invite.id ? <Check /> : undefined}
                label={copiedId === invite.id ? "Copied" : "Copy link"}
                onClick={() => {
                  copy(invite);
                }}
                size="sm"
                variant="secondary"
              />
              <Button
                label="Revoke"
                onClick={() => {
                  revoke(invite);
                }}
                size="sm"
                variant="ghost"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
