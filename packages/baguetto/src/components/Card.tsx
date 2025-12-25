import React, { useState, useRef } from "react";
import {
  FaStar,
  FaBookmark,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
} from "react-icons/fa6";

export interface CardProps {
  id: string | number;
  title: string;
  images: string[];
  artist: {
    name: string;
    avatar: string;
    verified?: boolean;
    level?: number;
  };
  rating: number;
  reviewCount: number;
  status?: "OPEN" | "CLOSED" | "WAITLIST";
  price?: string;
  href?: string;
  imageClass?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  images,
  artist,
  rating,
  reviewCount,
  status = "OPEN",
  href = "#",
  imageClass = "h-auto w-full object-cover",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const displayImages = images.length > 0
    ? images
    : [`https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(title)}`];

  const currentImage = displayImages[currentImageIndex];

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({ left: width * index, behavior: "smooth" });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex < displayImages.length - 1) {
      scrollToIndex(currentImageIndex + 1);
    } else {
      scrollToIndex(0);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex > 0) {
      scrollToIndex(currentImageIndex - 1);
    } else {
      scrollToIndex(displayImages.length - 1);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const index = Math.round(
        carouselRef.current.scrollLeft / carouselRef.current.clientWidth
      );
      if (index !== currentImageIndex && index >= 0 && index < displayImages.length) {
        setCurrentImageIndex(index);
      }
    }
  };

  return (
    <div
      className="flex flex-col gap-3 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-200">
        <a href={href} className="block w-full relative">
          {/* Radiant Background */}
          <div
            className="absolute inset-0 z-0 scale-110 blur-xl opacity-60 transition-all duration-700"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Images Carousel */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="carousel carousel-center w-full relative z-10 scrollbar-hide flex"
          >
            {displayImages.map((img, index) => (
              <div key={index} className="carousel-item w-full flex-shrink-0">
                <img
                  src={img}
                  alt={`${title} - image ${index + 1}`}
                  className={`${imageClass} w-full block`}
                />
              </div>
            ))}
          </div>
        </a>

        {/* Status Badge */}
        {status === "OPEN" && (
          <div className="absolute left-3 top-3 z-20 rounded-md bg-[#d1fa31] px-2 py-1 text-xs font-bold text-black uppercase tracking-wide">
            Open
          </div>
        )}

        {/* Bookmark Button */}
        <button className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm transition hover:bg-white">
          <FaBookmark className="h-4 w-4" />
        </button>

        {/* Navigation Arrows - Only visible on hover and if multiple images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-opacity duration-200 hover:bg-black/70 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className={`absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-opacity duration-200 hover:bg-black/70 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
            {displayImages.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full shadow-sm transition-all ${
                  index === currentImageIndex
                    ? "bg-white scale-110"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
          <a href={href} className="hover:underline">
            {title}
          </a>
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-gray-100"
              />
            </div>
            <span className="text-sm font-medium text-gray-600 truncate max-w-[100px]">
              {artist.name}
            </span>
            {artist.verified && (
              <FaCircleCheck className="h-3.5 w-3.5 text-primary" />
            )}
            {artist.level && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
                {artist.level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
            <FaStar className="h-3.5 w-3.5 text-black" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
