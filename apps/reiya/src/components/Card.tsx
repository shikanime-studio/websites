import type { CarouselHandle } from "@astryxdesign/core/Carousel";
import type { MouseEvent, ReactNode } from "react";
import type { CardData } from "../lib/api-client";
import { Carousel } from "@astryxdesign/core/Carousel";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Image } from "@unpic/react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Files,
} from "lucide-react";
import { useRef, useState } from "react";

export interface CardProps {
  children?: ReactNode;
}

export function Card({ children }: CardProps) {
  return <div className="flex w-full flex-col gap-3">{children}</div>;
}

export interface CardInfoProps extends CardData {
  onClick?: () => void;
}

export function CardInfo({
  title,
  href,
  artist,
  rating,
  reviewCount,
  onClick,
}: CardInfoProps) {
  const handleTitleClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <h3 className="truncate text-lg leading-tight font-bold text-secondary">
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
              layout="constrained"
              className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-border"
            />
          </div>
          <span className="max-w-25 truncate text-sm font-medium text-secondary/80">
            {artist.name}
          </span>
          {artist.verified && (
            <CircleCheck className="text-accent h-3.5 w-3.5" />
          )}
          {artist.level && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-muted text-[10px] font-bold text-accent">
              {artist.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4 text-accent"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-secondary">{rating}</span>
          <span className="text-sm text-secondary/70">({reviewCount})</span>
        </div>
      </div>
    </div>
  );
}

export interface CardRadiantBackgroundProps {
  image: string;
}

export function CardRadiantBackground({ image }: CardRadiantBackgroundProps) {
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
}

export interface CardPaginationProps {
  children?: ReactNode;
}

export function CardPagination({ children }: CardPaginationProps) {
  return (
    <div className="absolute right-0 bottom-3 left-0 z-20 flex justify-center gap-1.5">
      {children}
    </div>
  );
}

export interface CardPaginationDotProps {
  active?: boolean;
}

export function CardPaginationDot({ active }: CardPaginationDotProps) {
  return (
    <div
      className={`h-1.5 w-1.5 rounded-full shadow-sm transition-all ${
        active ? "scale-110 bg-body" : "bg-body/50"
      }`}
    />
  );
}

export interface CardNavigationProps {
  onNextClick: (e: MouseEvent) => void;
  onPrevClick: (e: MouseEvent) => void;
}

export function CardNavigation({
  onNextClick,
  onPrevClick,
}: CardNavigationProps) {
  return (
    <>
      <IconButton
        variant="secondary"
        label="Next image"
        icon={<ChevronRight className="h-4 w-4" />}
        onClick={onNextClick}
        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <IconButton
        variant="secondary"
        label="Previous image"
        icon={<ChevronLeft className="h-4 w-4" />}
        onClick={onPrevClick}
        className="absolute top-1/2 left-2 z-20 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </>
  );
}

export interface CardStatusProps {
  status: "OPEN" | "CLOSED" | "WAITLIST";
}

export function CardStatus({ status }: CardStatusProps) {
  if (status !== "OPEN") return null;

  return (
    <div className="bg-accent text-on-accent absolute top-3 left-3 z-20 rounded-md px-2 py-1 text-xs font-bold tracking-wide uppercase">
      Open
    </div>
  );
}

export interface CardBookmarkProps {
  onClick?: (e: MouseEvent) => void;
}

export function CardBookmark({ onClick }: CardBookmarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-body/90 text-secondary shadow-sm transition hover:bg-body"
    >
      <Bookmark className="h-4 w-4" />
    </button>
  );
}

export interface CardCarouselProps {
  title: string;
  images: Array<ReactNode>;
  href?: string;
  backgroundImages?: Array<string>;
  children?: ReactNode;
  onClick?: () => void;
}

export function CardCarousel({
  title,
  images,
  href = "#",
  children,
  onClick,
}: CardCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselHandleRef = useRef<CarouselHandle>(null);

  const handleNextClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const maxIndex = images.length > 0 ? images.length - 1 : 0;
    if (currentImageIndex < maxIndex) {
      carouselHandleRef.current?.scrollTo(currentImageIndex + 1);
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      carouselHandleRef.current?.scrollTo(0);
      setCurrentImageIndex(0);
    }
  };

  const handlePrevClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const maxIndex = images.length > 0 ? images.length - 1 : 0;
    if (currentImageIndex > 0) {
      carouselHandleRef.current?.scrollTo(currentImageIndex - 1);
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      carouselHandleRef.current?.scrollTo(maxIndex);
      setCurrentImageIndex(maxIndex);
    }
  };

  const handleContainerClick = (e: MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="hover:shadow-primary/20 group relative aspect-video w-full overflow-hidden rounded-2xl bg-surface shadow-none transition-all duration-500 ease-out hover:shadow-xl">
      <a
        href={href}
        onClick={handleContainerClick}
        className="relative block h-full w-full"
      >
        <Carousel
          hasSnap
          hasLoop
          hasButtons={false}
          hasEdgeFade={false}
          aria-label={title}
          handleRef={carouselHandleRef}
          className="relative z-10 h-full w-full"
        >
          {images.length > 0 ? (
            images.map((img) => (
              <div key={images.indexOf(img)} className="h-full w-full">
                {img}
              </div>
            ))
          ) : (
            <div className="h-full w-full">
              <Image
                src={`https://placehold.co/600x800/ffe4e6/be123c?text=${encodeURIComponent(
                  title,
                )}`}
                alt={title}
                width={600}
                height={800}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </Carousel>
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
}

export function CardCarouselCount({ count }: { count: number }) {
  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-md bg-overlay px-2 py-1 text-xs font-bold text-body backdrop-blur-sm">
      <Files className="h-3 w-3" />
      <span>{count}</span>
    </div>
  );
}

export interface CardShowcaseCarouselProps {
  title: string;
  images: Array<ReactNode>;
  href?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function CardShowcaseCarousel({
  title,
  images,
  href = "#",
  children,
  onClick,
}: CardShowcaseCarouselProps) {
  const firstImage = images[0] ?? (
    <Image
      src={`https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(
        title,
      )}`}
      alt={title}
      width={600}
      height={400}
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
    <div className="hover:shadow-primary/20 group relative w-full overflow-hidden rounded-2xl bg-surface shadow-none transition-all duration-500 ease-out hover:shadow-xl">
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
}
