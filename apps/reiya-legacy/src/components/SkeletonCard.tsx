import type { FC } from "react";

export const SkeletonCard: FC = () => {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Image Skeleton */}
      <div className="skeleton aspect-4/3 w-full rounded-2xl"></div>

      {/* Info Skeleton */}
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="skeleton h-5 w-3/4"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="skeleton h-5 w-5 rounded-full"></div>
            {/* Name */}
            <div className="skeleton h-4 w-24"></div>
          </div>
          {/* Rating */}
          <div className="skeleton h-4 w-16"></div>
        </div>
      </div>
    </div>
  );
};
