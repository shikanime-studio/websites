import { RegistryProvider } from "@effect/atom-react";
import {
  artistsAtom,
  charactersAtom,
  eventsAtom,
  merchsAtom,
} from "../lib/atoms";
import { GalleryContent } from "./Gallery";
import { Tab, TabContent, TabList } from "./TabList";

export function Following() {
  return (
    <RegistryProvider>
      <TabList defaultTab="merchs">
        {(tab) => (
          <>
        <Tab active={tab.value === "merchs"} name="following_tabs" onSelect={tab.select} value="merchs">
          Merchs
        </Tab>
        <TabContent active={tab.value === "merchs"}>
          <GalleryContent atom={merchsAtom} />
        </TabContent>

        <Tab active={tab.value === "events"} name="following_tabs" onSelect={tab.select} value="events">
          Events
        </Tab>
        <TabContent active={tab.value === "events"}>
          <GalleryContent atom={eventsAtom} />
        </TabContent>

        <Tab active={tab.value === "artists"} name="following_tabs" onSelect={tab.select} value="artists">
          Artists
        </Tab>
        <TabContent active={tab.value === "artists"}>
          <GalleryContent atom={artistsAtom} />
        </TabContent>

        <Tab active={tab.value === "characters"} name="following_tabs" onSelect={tab.select} value="characters">
          Characters
        </Tab>
        <TabContent active={tab.value === "characters"}>
          <GalleryContent atom={charactersAtom} />
        </TabContent>
          </>
        )}
      </TabList>
    </RegistryProvider>
  );
}
