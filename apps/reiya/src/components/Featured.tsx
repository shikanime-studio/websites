import { Card, CardBookmark, CardCarousel, CardInfo, CardStatus } from "./Card";
import type { CardData } from "./Card";
import { EmptyState } from "./EmptyState";
import { Image } from "./Image";
import type { FC } from "react";
import { FaArrowRight } from "react-icons/fa6";

interface FeaturedProps {
  title?: string;
  items: Array<CardData>;
  className?: string;
  viewAllLink?: string;
}

export const Featured: FC<FeaturedProps> = ({
  title,
  items,
  className = "",
  viewAllLink,
}) => {
  return (
    <div className={`flex w-full flex-col gap-6 ${className}`}>
      {(title || viewAllLink) && (
        <div className="flex items-center justify-between px-1">
          {title && (
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          )}
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
            >
              View all
              <FaArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {items.length > 0 ? (
        <div className="carousel carousel-center scrollbar-hide -mx-4 w-full gap-4 px-4 sm:mx-0 sm:px-0">
          {items.map((item) => (
            <FeaturedCarouselItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No items yet"
          description="We couldn't find any items to display in this section."
        />
      )}
    </div>
  );
};

interface FeaturedCarouselItemProps {
  item: CardData;
}

const FeaturedCarouselItem: FC<FeaturedCarouselItemProps> = ({ item }) => {
  return (
    <div className="carousel-item w-[280px] min-w-[280px] sm:w-[320px] sm:min-w-[320px]">
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
};
