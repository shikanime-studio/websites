import { Image } from "./Image";
import { useRef, useState } from "react";
import type { FC, MouseEvent, ReactNode } from "react";
import {
  FaBookmark,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
  FaRegClone,
} from "react-icons/fa6";

export interface CardData {
  id: string | number;
  title: string;
  status: "OPEN" | "CLOSED" | "WAITLIST";
  href: string;
  images: Array<{
    src: string;
    width: number;
    height: number;
  }>;
  artist: {
    name: string;
    avatar: {
      src: string;
      width: number;
      height: number;
    };
    verified?: boolean;
    level?: number;
  };
  rating: number;
  reviewCount: number;
  price?: string;
}

export interface CardProps {
  children?: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
  return <div className="flex w-full flex-col gap-3">{children}</div>;
};

export interface CardInfoProps extends CardData {
  onClick?: () => void;
}

export const CardInfo: FC<CardInfoProps> = ({
  title,
  href = "#",
  artist,
  rating,
  reviewCount,
  onClick,
}) => {
  const handleTitleClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <h3 className="truncate text-lg leading-tight font-bold text-gray-900">
        <a href={href} onClick={handleTitleClick} className="hover:underline">
          {title}
        </a>
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image
              src={artist.avatar.src}
              width={artist.avatar.width}
              height={artist.avatar.height}
              alt={artist.name}
              className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-gray-100"
            />
          </div>
          <span className="max-w-25 truncate text-sm font-medium text-gray-600">
            {artist.name}
          </span>
          {artist.verified && (
            <FaCircleCheck className="text-primary h-3.5 w-3.5" />
          )}
          {artist.level && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
              {artist.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">{rating}</span>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>
      </div>
    </div>
  );
};

export interface CardRadiantBackgroundProps {
  image: string;
}

export const CardRadiantBackground: FC<CardRadiantBackgroundProps> = ({
  image,
}) => {
  return (
    <div
      className="absolute inset-0 z-0 scale-110 opacity-60 blur-xl transition-all duration-700"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export interface CardPaginationProps {
  children?: ReactNode;
}

export const CardPagination: FC<CardPaginationProps> = ({ children }) => {
  return (
    <div className="absolute right-0 bottom-3 left-0 z-20 flex justify-center gap-1.5">
      {children}
    </div>
  );
};

export interface CardPaginationDotProps {
  active?: boolean;
}

export const CardPaginationDot: FC<CardPaginationDotProps> = ({ active }) => {
  return (
    <div
      className={`h-1.5 w-1.5 rounded-full shadow-sm transition-all ${
        active ? "scale-110 bg-white" : "bg-white/50"
      }`}
    />
  );
};

export interface CardNavigationProps {
  onNextClick: (e: MouseEvent) => void;
  onPrevClick: (e: MouseEvent) => void;
}

export const CardNavigation: FC<CardNavigationProps> = ({
  onNextClick,
  onPrevClick,
}) => {
  return (
    <>
      {/* Navigation Arrows - Only visible on hover and if multiple images */}
      <button
        type="button"
        onClick={onNextClick}
        className="absolute top-1/2 right-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70"
      >
        <FaChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onPrevClick}
        className="absolute top-1/2 left-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>
    </>
  );
};

export interface CardStatusProps {
  status: "OPEN" | "CLOSED" | "WAITLIST";
}

export const CardStatus: FC<CardStatusProps> = ({ status }) => {
  if (status !== "OPEN") return null;

  return (
    <div className="bg-primary absolute top-3 left-3 z-20 rounded-md px-2 py-1 text-xs font-bold tracking-wide text-black uppercase">
      Open
    </div>
  );
};

export interface CardBookmarkProps {
  onClick?: (e: MouseEvent) => void;
}

export const CardBookmark: FC<CardBookmarkProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm transition hover:bg-white"
    >
      <FaBookmark className="h-4 w-4" />
    </button>
  );
};

export interface CardCarouselProps {
  title: string;
  images: Array<ReactNode>;
  href?: string;
  backgroundImages?: Array<string>;
  children?: ReactNode;
  onClick?: () => void;
}

export const CardCarousel: FC<CardCarouselProps> = ({
  title,
  images,
  href = "#",
  children,
  onClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  };

  const handleNextClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const maxIndex = images.length > 0 ? images.length - 1 : 0;
    if (currentImageIndex < maxIndex) {
      scrollToIndex(currentImageIndex + 1);
    } else {
      scrollToIndex(0);
    }
  };

  const handlePrevClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const maxIndex = images.length > 0 ? images.length - 1 : 0;
    if (currentImageIndex > 0) {
      scrollToIndex(currentImageIndex - 1);
    } else {
      scrollToIndex(maxIndex);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const index = Math.round(
        carouselRef.current.scrollLeft / carouselRef.current.clientWidth,
      );
      if (index !== currentImageIndex && index >= 0 && index < images.length) {
        setCurrentImageIndex(index);
      }
    }
  };

  const handleContainerClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="hover:shadow-primary/20 group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 shadow-none transition-all duration-500 ease-out hover:shadow-xl">
      <a
        href={href}
        onClick={handleContainerClick}
        className="relative block h-full w-full"
      >
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="carousel carousel-center scrollbar-hide relative z-10 flex h-full w-full snap-x snap-mandatory"
        >
          {images.length > 0 ? (
            images.map((img) => (
              <div
                key={crypto.randomUUID()}
                className="carousel-item h-full w-full shrink-0 snap-center"
              >
                {img}
              </div>
            ))
          ) : (
            <div className="carousel-item h-full w-full shrink-0 snap-center">
              <img
                src={`https://placehold.co/600x800/ffe4e6/be123c?text=${encodeURIComponent(
                  title,
                )}`}
                alt={title}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </div>
      </a>

      {children}

      {images.length > 1 && (
        <CardNavigation
          onNextClick={handleNextClick}
          onPrevClick={handlePrevClick}
        />
      )}

      {images.length > 1 && (
        <CardPagination>
          {images.map((_, index) => {
            return (
              <CardPaginationDot
                key={crypto.randomUUID()}
                active={index === currentImageIndex}
              />
            );
          })}
        </CardPagination>
      )}
    </div>
  );
};

export const CardCarouselCount: FC<{ count: number }> = ({ count }) => (
  <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
    <FaRegClone className="h-3 w-3" />
    <span>{count}</span>
  </div>
);

export interface CardShowcaseCarouselProps {
  title: string;
  images: Array<ReactNode>;
  href?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const CardShowcaseCarousel: FC<CardShowcaseCarouselProps> = ({
  title,
  images,
  href = "#",
  children,
  onClick,
}) => {
  const firstImage = images[0] || (
    <img
      src={`https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(
        title,
      )}`}
      alt={title}
      className="h-auto w-full"
    />
  );

  const handleContainerClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="hover:shadow-primary/20 group relative w-full overflow-hidden rounded-2xl bg-gray-200 shadow-none transition-all duration-500 ease-out hover:shadow-xl">
      <a
        href={href}
        onClick={handleContainerClick}
        className="relative block w-full"
      >
        <div className="relative z-10">
          {firstImage}
          {images.length > 1 && <CardCarouselCount count={images.length} />}
        </div>
      </a>
      {children}
    </div>
  );
};
