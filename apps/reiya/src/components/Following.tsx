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
        <Tab name="following_tabs" value="merchs">
          Merchs
        </Tab>
        <TabContent value="merchs">
          <GalleryContent atom={merchsAtom} />
        </TabContent>

        <Tab name="following_tabs" value="events">
          Events
        </Tab>
        <TabContent value="events">
          <GalleryContent atom={eventsAtom} />
        </TabContent>

        <Tab name="following_tabs" value="artists">
          Artists
        </Tab>
        <TabContent value="artists">
          <GalleryContent atom={artistsAtom} />
        </TabContent>

        <Tab name="following_tabs" value="characters">
          Characters
        </Tab>
        <TabContent value="characters">
          <GalleryContent atom={charactersAtom} />
        </TabContent>
      </TabList>
    </RegistryProvider>
  );
}
