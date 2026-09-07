import type { CardData } from "../lib/api-client";
import { Carousel } from "@astryxdesign/core/Carousel";
import { Image } from "@unpic/react";
import { ArrowRight } from "lucide-react";
import { Card, CardBookmark, CardCarousel, CardInfo, CardStatus } from "./Card";
import { EmptyState } from "./EmptyState";

interface FeaturedCarouselItemProps {
  item: CardData;
}

function FeaturedCarouselItem({ item }: FeaturedCarouselItemProps) {
  return (
    <div className="w-70 min-w-70 sm:w-[320px] sm:min-w-[320px]">
      <Card>
        <div className="w-full">
          <CardCarousel
            title={item.title}
            href={item.href}
            images={item.images.map((img) => (
              <Image
                key={img.src}
                src={img.src}
                alt={`${item.title} - image`}
                width={img.width}
                height={img.height}
                layout="constrained"
                className="h-full w-full object-contain"
              />
            ))}
          >
            <CardStatus status={item.status} />
            <CardBookmark />
          </CardCarousel>
        </div>
        <CardInfo {...item} />
      </Card>
    </div>
  );
}

interface FeaturedProps {
  title?: string;
  items: Array<CardData>;
  className?: string;
  viewAllLink?: string;
}

export function Featured({
  title,
  items,
  className = "",
  viewAllLink,
}: FeaturedProps) {
  return (
    <div className={`flex w-full flex-col gap-6 ${className}`}>
      {(title ?? viewAllLink) && (
        <div className="flex items-center justify-between px-1">
          {title && (
            <h2 className="text-xl font-bold text-secondary">{title}</h2>
          )}
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="flex items-center gap-1 text-sm font-bold text-secondary/70 transition-colors hover:text-secondary"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {items.length > 0 ? (
        <Carousel
          hasButtons={false}
          hasEdgeFade={false}
          className="-mx-4 w-full sm:mx-0"
        >
          {items.map((item) => (
            <FeaturedCarouselItem key={item.id} item={item} />
          ))}
        </Carousel>
      ) : (
        <EmptyState
          title="No items yet"
          description="We couldn't find any items to display in this section."
        />
      )}
    </div>
  );
}
