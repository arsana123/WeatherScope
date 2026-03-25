import React from "react";
import Card from "../cards/Card";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function SideCardSkeleton({}: Props) {
  return (
    <>
      <Card
        childrenClassName="flex flex-col gap-3"
        className="hover:scale-105 transition-transform duration-300 from-sidebar-accent to-sidebar-accent/60 gap-0!"
      >
        <div className="flex justify-between">
          <Skeleton className="h-7 w-12 bg-sidebar" />
          <Skeleton className="h-7 w-12 bg-sidebar" />
        </div>
        <Skeleton className="h-2 w-full" />

        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-15 h-6 bg-sidebar" />
          ))}
        </div>
      </Card>
    </>
  );
}
