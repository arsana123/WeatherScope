import { getAirPollution } from "@/api";
import type { Coords } from "../types";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { Suspense, type Dispatch, type SetStateAction } from "react";
import Card from "./cards/Card";
import { Slider } from "./ui/slider";
import clsx from "clsx";
import Information from "/src/assets/information.svg?react";
import ChevronLeft from "/src/assets/ChevronLeft.svg?react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import SidePanelSkeleton from "./skeletons/SidePanelSkeleton";

type Props = {
  coords: Coords;
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SidePanel(props: Props) {
  const { isSidePanelOpen, setIsSidePanelOpen } = props;
  return (
    <>
      <div
        className={clsx(
          "fixed top-0 right-0 h-screen w-(--sidebar-width) shadow-md bg-sidebar z-1001 py-8 px-4 overflow-y-scroll transition-transform duration-300 lg:translate-x-0!",
          isSidePanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button onClick={() => setIsSidePanelOpen(false)}>
          <ChevronLeft className="size-8 invert -ml-2 lg:hidden" />
        </button>
        <Suspense fallback={<SidePanelSkeleton />}>
          <AirPollution {...props} />
        </Suspense>
      </div>
    </>
  );
}

function AirPollution({ coords }: Props) {
  const { data } = useSuspenseQuery({
    queryKey: ["airPollution", coords],
    queryFn: () => getAirPollution(coords),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Air Pollution</h1>
      <h1 className="text-3xl font-semibold">{data?.list[0].main.aqi}</h1>
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-semibold">AQI</h1>
        <Tooltip>
          <TooltipTrigger>
            <Information className="size-4 invert cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="z-1500">
            <p className="max-w-xs">
              Air Quality Index. Possible values: 1, 2, 3, 4, 5. Where 1 = Good,
              2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      {Object.entries(data?.list[0].components).map(([key, value]) => {
        const pollutant =
          airQualityRanges[key.toUpperCase() as keyof AirQualityRanges];
        const max = Math.max(pollutant["Very Poor"].min, value);
        const currentLevel = (() => {
          for (const [level, range] of Object.entries(pollutant)) {
            if (value >= range.min && (range.max === null || value < range.max))
              return level;
          }
          return "Very Poor";
        })();

        const qualityColor = (() => {
          switch (currentLevel) {
            case "Good":
              return "bg-green-500";
            case "Fair":
              return "bg-lime-500";
            case "Moderate":
              return "bg-yellow-500";
            case "Poor":
              return "bg-orange-500";
            case "Very Poor":
              return "bg-red-500";
          }
        })();

        return (
          <Card
            key={key}
            childrenClassName="flex flex-col gap-3"
            className="hover:scale-105 transition-transform duration-300 from-sidebar-accent to-sidebar-accent/60 gap-0!"
          >
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold capitalize">{key}</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Information className="size-4 invert cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="z-1500">
                    <p className="max-w-xs">
                      Concentration of{" "}
                      {pollutantNameMapping[key.toUpperCase() as Pollutant]}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-lg font-semibold">{value}</span>
            </div>
            <Slider disabled min={0} max={max} value={[value]} />

            <div className="flex justify-between">
              {Object.keys(pollutant).map((quality) => (
                <span
                  className={clsx(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    quality === currentLevel
                      ? qualityColor
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {quality}
                </span>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

type AirQualityLevel = "Good" | "Fair" | "Moderate" | "Poor" | "Very Poor";

interface Range {
  min: number;
  max: number | null;
}

type Pollutant = "SO2" | "NO2" | "PM10" | "PM2_5" | "O3" | "CO" | "NO" | "NH3";

type AirQualityRanges = Record<Pollutant, Record<AirQualityLevel, Range>>;

const airQualityRanges: AirQualityRanges = {
  SO2: {
    Good: { min: 0, max: 20 },
    Fair: { min: 20, max: 80 },
    Moderate: { min: 80, max: 250 },
    Poor: { min: 250, max: 350 },
    "Very Poor": { min: 350, max: null },
  },
  NO2: {
    Good: { min: 0, max: 40 },
    Fair: { min: 40, max: 70 },
    Moderate: { min: 70, max: 150 },
    Poor: { min: 150, max: 200 },
    "Very Poor": { min: 200, max: null },
  },
  PM10: {
    Good: { min: 0, max: 20 },
    Fair: { min: 20, max: 50 },
    Moderate: { min: 50, max: 100 },
    Poor: { min: 100, max: 200 },
    "Very Poor": { min: 200, max: null },
  },
  PM2_5: {
    Good: { min: 0, max: 10 },
    Fair: { min: 10, max: 25 },
    Moderate: { min: 25, max: 50 },
    Poor: { min: 50, max: 75 },
    "Very Poor": { min: 75, max: null },
  },
  O3: {
    Good: { min: 0, max: 60 },
    Fair: { min: 60, max: 100 },
    Moderate: { min: 100, max: 140 },
    Poor: { min: 140, max: 180 },
    "Very Poor": { min: 180, max: null },
  },
  CO: {
    Good: { min: 0, max: 4400 },
    Fair: { min: 4400, max: 9400 },
    Moderate: { min: 9400, max: 12400 },
    Poor: { min: 12400, max: 15400 },
    "Very Poor": { min: 15400, max: null },
  },
  NO: {
    Good: { min: 0, max: 20 },
    Fair: { min: 20, max: 40 },
    Moderate: { min: 40, max: 60 },
    Poor: { min: 60, max: 80 },
    "Very Poor": { min: 80, max: null },
  },
  NH3: {
    Good: { min: 0, max: 40 },
    Fair: { min: 40, max: 70 },
    Moderate: { min: 70, max: 150 },
    Poor: { min: 150, max: 200 },
    "Very Poor": { min: 200, max: null },
  },
};

const pollutantNameMapping: Record<Pollutant, string> = {
  SO2: "Sulfur dioxide",
  NO2: "Nitrogen dioxide",
  PM10: "Particulate matter 10",
  PM2_5: "Fine particles matter",
  O3: "Ozone",
  CO: "Carbon monoxide",
  NO: "Nitrogen monoxide",
  NH3: "Ammonia",
};
