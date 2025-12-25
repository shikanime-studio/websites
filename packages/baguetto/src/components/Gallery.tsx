import React from "react";
import { Card, type CardProps } from "./Card";

interface GalleryProps {
  items: CardProps[];
  className?: string;
  gridClass?: string;
}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  className = "",
  gridClass = "columns-1 sm:columns-2 lg:columns-4 gap-4",
}) => {
  return (
    <div className={`${gridClass} ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid mb-4">
          <Card {...item} />
        </div>
      ))}
    </div>
  );
};
