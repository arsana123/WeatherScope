import React from "react";
import Card from "../cards/Card";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function CurrentSkeleton({}: Props) {
  return (
    <>
      <Card
        title="Current Weather"
        childrenClassName="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col gap-2 items-center">
          <Skeleton className="w-30 h-15" />
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="w-40 h-7" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xl text-center">Local Time:</p>
          <Skeleton className="w-30 h-10 mx-auto" />
        </div>

        <div className="flex justify-between w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Feels Like</p>
            <Skeleton className="w-16 h-6" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Humidity</p>
            <Skeleton className="w-16 h-6" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Wind</p>
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
      </Card>
    </>
  );
}
