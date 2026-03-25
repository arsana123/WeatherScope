import React from "react";
import Card from "../cards/Card";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function HourlySkeleton({}: Props) {
  return (
    <>
      <Card
        title="Hourly Forecast (48 hours)"
        childrenClassName="flex gap-6 overflow-x-auto"
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 items-center p-2">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="w-8 h-6" />
          </div>
        ))}
      </Card>
    </>
  );
}
