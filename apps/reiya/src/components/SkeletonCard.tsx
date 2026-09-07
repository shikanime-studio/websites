import { Skeleton } from "@astryxdesign/core/Skeleton";

export function SkeletonCard() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Skeleton className="aspect-4/3 w-full" radius={4} />

      <div className="flex flex-col gap-2">
        <Skeleton className="w-3/4" height={20} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={20} height={20} radius="rounded" />
            <Skeleton width={96} height={16} />
          </div>
          <Skeleton width={64} height={16} />
        </div>
      </div>
    </div>
  );
}
