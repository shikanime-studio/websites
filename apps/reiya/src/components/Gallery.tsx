import type * as AsyncResultType from "effect/reactivity/AsyncResult";
import type { Atom } from "effect/reactivity/Atom";
import type { ReactNode } from "react";
import type { CardData } from "../lib/api-client";
import { Image } from "@unpic/react";
import { getOrElse, isInitial } from "effect/reactivity/AsyncResult";
import { Activity, useState } from "react";
import { useCardResult } from "../hooks/useCardResult";
import {
  Card,
  CardBookmark,
  CardCarousel,
  CardInfo,
  CardShowcaseCarousel,
  CardStatus,
} from "./Card";
import { CardModal } from "./CardModal";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "./SkeletonCard";

interface GalleryProps {
  children?: ReactNode;
}

export function Gallery({ children }: GalleryProps) {
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-4">{children}</div>
  );
}

interface GalleryItemProps {
  children: ReactNode;
}

export function GalleryItem({ children }: GalleryItemProps) {
  return <div className="mb-4 break-inside-avoid">{children}</div>;
}

type CardsAtom = Atom<AsyncResultType.AsyncResult<Array<CardData>, unknown>>;

interface GalleryContentProps {
  atom: CardsAtom;
  variant?: "default" | "showcase";
}

export function GalleryItems({
  items,
  variant = "default",
  onSelect,
}: {
  items: Array<CardData>;
  variant?: "default" | "showcase";
  onSelect: (card: CardData) => void;
}) {
  const CardComponent
    = variant === "showcase" ? CardShowcaseCarousel : CardCarousel;

  if (items.length === 0) {
    return (
      <div className="w-full [column-span:all]">
        <EmptyState
          title="No results found"
          description="Try a different word, or clear the search to browse everything."
        />
      </div>
    );
  }

  return items.map((item) => (
    <GalleryItem key={item.id}>
      <Card>
        <CardComponent
          title={item.title}
          href={item.href}
          onClick={() => {
            onSelect(item);
          }}
          images={item.images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={`${item.title} - image ${String(i + 1)}`}
              width={img.width}
              height={img.height}
              layout="constrained"
              className="h-full w-full object-contain"
            />
          ))}
        >
          <CardStatus status={item.status} />
          <CardBookmark />
        </CardComponent>
        <CardInfo
          {...item}
          onClick={() => {
            onSelect(item);
          }}
        />
      </Card>
    </GalleryItem>
  ));
}

export function GalleryContent({
  atom,
  variant = "default",
}: GalleryContentProps) {
  const result = useCardResult(atom, "Failed to load gallery");
  const items = getOrElse(result, () => []);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <>
      <Activity mode={isInitial(result) ? "visible" : "hidden"}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isInitial(result) ? "hidden" : "visible"}>
        <GalleryItems
          items={items}
          variant={variant}
          onSelect={setSelectedCard}
        />
      </Activity>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setSelectedCard(null);
          }}
        />
      )}
    </>
  );
}

export function ShowcaseGalleryContent({
  atom,
}: Omit<GalleryContentProps, "variant">) {
  const result = useCardResult(atom, "Failed to load gallery");
  const items = getOrElse(result, () => []);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <>
      <Activity mode={isInitial(result) ? "visible" : "hidden"}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isInitial(result) ? "hidden" : "visible"}>
        {items.length > 0 ? (
          items.map((item) => (
            <GalleryItem key={item.id}>
              <Card>
                <CardShowcaseCarousel
                  title={item.title}
                  href={item.href}
                  onClick={() => {
                    setSelectedCard(item);
                  }}
                  images={item.images.map((img, i) => (
                    <Image
                      key={img.src}
                      src={img.src}
                      alt={`${item.title} - image ${String(i + 1)}`}
                      width={img.width}
                      height={img.height}
                      layout="constrained"
                      className="h-full w-full object-contain"
                    />
                  ))}
                />
                <CardInfo
                  {...item}
                  onClick={() => {
                    setSelectedCard(item);
                  }}
                />
              </Card>
            </GalleryItem>
          ))
        ) : (
          <div className="w-full [column-span:all]">
            <EmptyState
              title="No showcases found"
              description="Check back later for new findings."
            />
          </div>
        )}
      </Activity>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setSelectedCard(null);
          }}
        />
      )}
    </>
  );
}
