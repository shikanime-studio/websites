import React from "react";
import { Card, type CardProps } from "./Card";
import { FaArrowRight } from "react-icons/fa6";

interface FeaturedProps {
  title: string;
  items: CardProps[];
  className?: string;
  viewAllLink?: string;
}

export const Featured: React.FC<FeaturedProps> = ({
  title,
  items,
  className = "",
  viewAllLink = "#",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all
            <FaArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="carousel carousel-center w-full gap-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-item min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px]"
          >
            <Card {...item} imageClass="aspect-[3/2] w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};
