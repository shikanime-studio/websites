import {
  fetchArtists,
  fetchCharacters,
  fetchEvents,
  fetchMerchs,
} from '../lib/api-client'
import { GalleryContent } from './Gallery'
import { QueryProvider } from './QueryProvider'
import { Tab, TabContent, TabList } from './TabList'

export function Following() {
  return (
    <QueryProvider>
      <TabList defaultTab="merchs">
        <Tab name="following_tabs" value="merchs">
          Merchs
        </Tab>
        <TabContent value="merchs">
          <GalleryContent queryKey={['merchs']} queryFn={fetchMerchs} />
        </TabContent>

        <Tab name="following_tabs" value="events">
          Events
        </Tab>
        <TabContent value="events">
          <GalleryContent queryKey={['events']} queryFn={fetchEvents} />
        </TabContent>

        <Tab name="following_tabs" value="artists">
          Artists
        </Tab>
        <TabContent value="artists">
          <GalleryContent queryKey={['artists']} queryFn={fetchArtists} />
        </TabContent>

        <Tab name="following_tabs" value="characters">
          Characters
        </Tab>
        <TabContent value="characters">
          <GalleryContent queryKey={['characters']} queryFn={fetchCharacters} />
        </TabContent>
      </TabList>
    </QueryProvider>
  )
}
