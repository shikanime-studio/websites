import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Switch } from "@astryxdesign/core/Switch";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useAtomRefresh, useAtomValue  } from "@effect/atom-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isFailure, isInitial } from "effect/reactivity/AsyncResult";
import { useEffect, useState } from "react";
import { sessionAtom } from "../lib/atoms";
import { getMyProfile, saveMyProfile } from "../lib/server";

export const Route = createFileRoute("/profile")({
  component: ProfileEditorPage,
});

interface LinkEntry {
  label: string;
  url: string;
}

const AT_PREFIX = /^@/;

function ProfileEditorPage() {
  const session = useAtomValue(sessionAtom);
  const signedIn = !isFailure(session) && !isInitial(session) && session.value;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [instagram, setInstagram] = useState("");
  const [acceptRequests, setAcceptRequests] = useState(true);
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const refreshSession = useAtomRefresh(sessionAtom);

  useEffect(() => {
    if (!signedIn) return;
    void getMyProfile().then((profile) => {
      setSlug(profile.slug);
      setHeadline(profile.headline);
      setBio(profile.bio);
      setLocation(profile.location);
      setInstagram(profile.instagram);
      setLinks(profile.links);
      setAcceptRequests(profile.acceptRequests);
    });
  }, [signedIn]);

  if (!signedIn) {
    return (
      <div className="hk-shell py-16 text-center">
        <p className="text-ink-soft text-[13px]">Sign in to edit your public profile.</p>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await saveMyProfile({
        data: {
          slug,
          headline,
          bio,
          location,
          instagram: instagram.replace(AT_PREFIX, ""),
          links: links.filter((link) => link.label && link.url),
          acceptRequests,
        },
      });
      setSaved(true);
      refreshSession();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="hk-shell max-w-2xl py-10">
      <header className="flex flex-col gap-1.5">
        <p className="hk-eyebrow">Public profile</p>
        <h1 className="hk-display text-[clamp(1.7rem,4vw,2.4rem)]">
          Your page
        </h1>
        <p className="text-ink-soft text-[12.5px]">
          One link for everything: who you are, what is coming up, and the
          work you have delivered.
        </p>
      </header>

      <Card className="mt-6" padding={6}>
        <div className="flex flex-col gap-5">
          <TextInput
            description="Your page lives at /<handle>"
            isRequired
            label="Handle"
            onChange={setSlug}
            placeholder="shikanime"
            value={slug}
          />
          {slug ? (
            <a
              className="text-accent -mt-3 block text-[12px] hover:underline"
              href={`/${slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open your page →
            </a>
          ) : null}
          <TextInput
            isOptional
            label="Headline"
            onChange={setHeadline}
            placeholder="Cosplay & portrait photographer — Paris"
            value={headline}
          />
          <TextArea
            isOptional
            label="Short bio"
            onChange={setBio}
            rows={3}
            value={bio}
          />
          <TextInput
            isOptional
            label="Based in"
            onChange={setLocation}
            placeholder="Paris, France"
            value={location}
          />
          <TextInput
            description="Handle without @ — links to instagram.com/<handle>"
            isOptional
            label="Instagram"
            onChange={setInstagram}
            placeholder="shikanime"
            value={instagram}
          />
          <Switch
            label="Accept new requests"
            onChange={(checked) => {
              setAcceptRequests(checked);
            }}
            value={acceptRequests}
          />
        </div>
      </Card>

      <Card className="mt-5" padding={6}>
        <p className="hk-eyebrow">Links</p>
        <div className="mt-3 flex flex-col gap-3">
          {links.map((link, index) => (
            <div className="flex gap-2" key={index}>
              <TextInput
                isRequired
                label="Label"
                onChange={(label) => {
                  setLinks((current) => current.map((item, i) => (i === index ? { ...item, label } : item)));
                }}
                placeholder="Portfolio"
                value={link.label}
              />
              <TextInput
                isRequired
                label="URL"
                onChange={(url) => {
                  setLinks((current) => current.map((item, i) => (i === index ? { ...item, url } : item)));
                }}
                placeholder="https://…"
                value={link.url}
              />
              <Button
                aria-label="Remove link"
                icon={<span aria-hidden>×</span>}
                label="Remove"
                onClick={() => {
                  setLinks((current) => current.filter((_, i) => i !== index));
                }}
                size="sm"
                variant="ghost"
              />
            </div>
          ))}
          {links.length < 8 ? (
            <Button
              label="Add link"
              onClick={() => {
                setLinks((current) => [...current, { label: "", url: "" }]);
              }}
              size="sm"
              variant="secondary"
            />
          ) : null}
        </div>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button
          isDisabled={saving || slug.trim().length < 2}
          isLoading={saving}
          label="Save profile"
          onClick={() => {
            void save();
          }}
          variant="primary"
        />
        {saved ? <span className="text-ink-soft text-[12px]">Saved.</span> : null}
        <Link className="text-ink-soft text-[12px] hover:underline" to="/">
          Back to the board
        </Link>
      </div>
    </div>
  );
}
