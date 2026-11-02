import type { CommissionRole } from "../schema";
import { Button } from "@astryxdesign/core/Button";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { COMMISSION_ROLES, ROLE_LABELS } from "../lib/cast";
import { Plus } from "./icons";

export interface CastDraft {
  id: string;
  role: CommissionRole;
  name: string;
}

/** A group shoot has several people, and most of them never made an account. */
export function CastEditor({
  value,
  onChange,
}: {
  value: CastDraft[];
  onChange: (next: CastDraft[]) => void;
}) {
  function update(index: number, patch: Partial<CastDraft>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="flex flex-col gap-2.5">
      {value.map((row, index) => (
        <div className="flex items-end gap-2" key={row.id}>
          <div className="w-[150px] shrink-0">
            <Selector
              label="Role"
              onChange={(role) => {
                update(index, { role: role as CommissionRole });
              }}
              options={COMMISSION_ROLES.map((role) => ({
                label: ROLE_LABELS[role],
                value: role,
              }))}
              size="sm"
              value={row.role}
            />
          </div>
          <div className="min-w-0 flex-1">
            <TextInput
              label="Name"
              onChange={(name) => {
                update(index, { name });
              }}
              placeholder="Name as it should appear on the call sheet"
              size="sm"
              value={row.name}
            />
          </div>
          <Button
            aria-label="Remove person"
            label="Remove"
            onClick={() => {
              onChange(value.filter((_, i) => i !== index));
            }}
            size="sm"
            variant="ghost"
          />
        </div>
      ))}
      {value.length < 12 ? (
        <div>
          <Button
            icon={<Plus />}
            label="Add someone"
            onClick={() => {
              onChange([
                ...value,
                {
                  id: crypto.randomUUID(),
                  role: "cosplayer",
                  name: "",
                },
              ]);
            }}
            size="sm"
            variant="ghost"
          />
        </div>
      ) : null}
    </div>
  );
}
