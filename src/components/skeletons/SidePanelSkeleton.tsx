import React from "react";
import SideCardSkeleton from "./SideCardSkeleton";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function SidePanelSkeleton({}: Props) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Air Pollution</h1>
        <Skeleton className="size-12" />
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">AQI</h1>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <SideCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
