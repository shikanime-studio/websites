import {
  Card,
  CardBookmark,
  CardCarousel,
  type CardData,
  CardInfo,
  CardShowcaseCarousel,
  CardStatus,
} from "./Card";
import { CardModal } from "./CardModal";
import { Image } from "./Image";
import { SkeletonCard } from "./SkeletonCard";
import { useQuery } from "@tanstack/react-query";
import type { FC, ReactNode } from "react";
import { Activity, useState } from "react";

interface GalleryProps {
  children?: ReactNode;
}

export const Gallery: FC<GalleryProps> = ({ children }) => {
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-4">{children}</div>
  );
};

interface GalleryContentProps {
  queryKey: string[];
  queryFn: () => Promise<CardData[]>;
  staleTime?: number;
  variant?: "default" | "showcase";
}

export const GalleryContent: FC<GalleryContentProps> = ({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 5,
  variant = "default",
}) => {
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime,
  });
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const CardComponent =
    variant === "showcase" ? CardShowcaseCarousel : CardCarousel;

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        {items.map((item) => (
          <GalleryItem key={item.id}>
            <Card>
              <CardComponent
                title={item.title}
                href={item.href}
                onClick={() => setSelectedCard(item)}
                images={item.images.map((img, i) => (
                  <Image
                    key={img.src}
                    src={img.src}
                    alt={`${item.title} - image ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    className="h-full w-full object-contain"
                  />
                ))}
              >
                <CardStatus status={item.status} />
                <CardBookmark />
              </CardComponent>
              <CardInfo {...item} onClick={() => setSelectedCard(item)} />
            </Card>
          </GalleryItem>
        ))}
      </Activity>
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
};

export const ShowcaseGalleryContent: FC<
  Omit<GalleryContentProps, "variant">
> = ({ queryKey, queryFn, staleTime = 1000 * 60 * 5 }) => {
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime,
  });
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        {items.map((item) => (
          <GalleryItem key={item.id}>
            <Card>
              <CardShowcaseCarousel
                title={item.title}
                href={item.href}
                onClick={() => setSelectedCard(item)}
                images={item.images.map((img, i) => (
                  <Image
                    key={img.src}
                    src={img.src}
                    alt={`${item.title} - image ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    className="h-full w-full object-contain"
                  />
                ))}
              >
                {/* No CardStatus, No CardBookmark */}
              </CardShowcaseCarousel>
              <CardInfo {...item} onClick={() => setSelectedCard(item)} />
            </Card>
          </GalleryItem>
        ))}
      </Activity>
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
};

interface GalleryItemProps {
  children: ReactNode;
}

export const GalleryItem: FC<GalleryItemProps> = ({ children }) => {
  return <div className="mb-4 break-inside-avoid">{children}</div>;
};
