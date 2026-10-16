import { useQuery } from "@tanstack/react-query";
import { Suspense, useState, type ReactNode } from "react";
import Hamburger from "/src/assets/hamburger.svg?react";
import { getGeoCode } from "./api";
import AdditionalInfo from "./components/cards/AdditionalInfo";
import CurrentWeather from "./components/cards/CurrentWeather";
import DailyForecast from "./components/cards/DailyForecast";
import HourlyForecast from "./components/cards/HourlyForecast";
import LocationDropdown from "./components/dropdowns/LocationDropdown";
import MapTypeDropdown from "./components/dropdowns/MapTypeDropdown";
import Map from "./components/Map";
import MapLegend from "./components/MapLegend";
import QueryBoundary from "./components/QueryBoundary";
import AdditionalInfoSkeleton from "./components/skeletons/AdditionalInfoSkeleton";
import CurrentSkeleton from "./components/skeletons/CurrentSkeleton";
import DailySkeleton from "./components/skeletons/DailySkeleton";
import HourlySkeleton from "./components/skeletons/HourlySkeleton";
import SidePanel from "./components/SidePanel";
import { USING_FREE_PROVIDER } from "./config";
import type { Coords } from "./types";

/** Shows a skeleton until coordinates are known, then loads data with error handling. */
function Section({
  coords,
  title,
  skeleton,
  children,
}: {
  coords: Coords | null;
  title: string;
  skeleton: ReactNode;
  children: ReactNode;
}) {
  if (!coords) return <>{skeleton}</>;
  return (
    <QueryBoundary title={title}>
      <Suspense fallback={skeleton}>{children}</Suspense>
    </QueryBoundary>
  );
}

function App() {
  const [coordinates, setCoordinates] = useState<Coords>({ lat: 0, long: 0 });

  const [location, setLocation] = useState<string>("Tokyo");
  const [mapType, setMapType] = useState<string>("clouds_new");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

  const {
    data: geoCodeData,
    isError: geoError,
    error: geoErrorDetail,
  } = useQuery({
    queryKey: ["geocode", location],
    queryFn: () => getGeoCode(location),
    enabled: location !== "custom",
  });

  const onMapClick = (newCoords: Coords) => {
    setCoordinates(newCoords);
    setLocation("custom");
  };

  // null until we actually know where to look (no more requests for 0,0)
  const place = geoCodeData?.[0];
  const coords: Coords | null =
    location === "custom"
      ? coordinates
      : place
        ? { lat: place.lat, long: place.lon }
        : null;

  const geoMessage = geoError
    ? `Couldn't look up "${location}": ${geoErrorDetail?.message ?? "unknown error"}`
    : geoCodeData && !place
      ? `No results found for "${location}".`
      : null;

  return (
    <>
      <div className="flex flex-col gap-8 p-8 w-full lg:w-[calc(100dvw-var(--sidebar-width))] 2xl:h-screen">
        <div className="flex gap-8">
          <div className="flex gap-4">
            <h1 className="text-2xl font-semibold">Location: </h1>
            <LocationDropdown location={location} setLocation={setLocation} />
          </div>
          <div className="flex gap-4">
            <h1 className="text-2xl font-semibold">Map Type: </h1>
            <MapTypeDropdown mapType={mapType} setMapType={setMapType} />
          </div>
          <button onClick={() => setIsSidePanelOpen(true)}>
            <Hamburger className="size-8 invert ml-auto lg:hidden" />
          </button>
        </div>

        {geoMessage && (
          <p className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-2 text-red-300">
            {geoMessage}
          </p>
        )}

        <div className="grid grid-cols-1 2xl:flex-1 2xl:min-h-0 gap-4 md:grid-cols-2 2xl:grid-cols-4 2xl:grid-rows-4">
          <div className="relative h-120 2xl:h-auto col-span-1 md:col-span-2 2xl:col-span-4 2xl:row-span-2 order-1">
            {coords ? (
              <Map coords={coords} onMapClick={onMapClick} mapType={mapType} />
            ) : (
              <div className="h-full w-full rounded-xl bg-white/5 animate-pulse" />
            )}
            <MapLegend mapType={mapType} />
          </div>
          <div className="col-span-1 2xl:row-span-2 order-2">
            <Section
              coords={coords}
              title="Current Weather"
              skeleton={<CurrentSkeleton />}
            >
              <CurrentWeather coords={coords!} />
            </Section>
          </div>
          <div className="col-span-1 order-3 2xl:order-4 2xl:row-span-2">
            <Section
              coords={coords}
              title="Daily Forecast"
              skeleton={<DailySkeleton />}
            >
              <DailyForecast coords={coords!} />
            </Section>
          </div>
          <div className="col-span-1 md:col-span-2 2xl:row-span-1 order-4 2xl:order-3">
            <Section
              coords={coords}
              title="Hourly Forecast (48 hours)"
              skeleton={<HourlySkeleton />}
            >
              <HourlyForecast coords={coords!} />
            </Section>
          </div>
          <div className="col-span-1 md:col-span-2 2xl:row-span-1 order-5">
            <Section
              coords={coords}
              title="Additional Weather Info"
              skeleton={<AdditionalInfoSkeleton />}
            >
              <AdditionalInfo coords={coords!} />
            </Section>
          </div>
        </div>

        {USING_FREE_PROVIDER && (
          <p className="text-xs text-gray-500">
            Weather data by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open-Meteo.com
            </a>{" "}
            (free, no API key). Add an OpenWeatherMap key to use that provider
            instead.
          </p>
        )}
      </div>

      <SidePanel
        coords={coords}
        isSidePanelOpen={isSidePanelOpen}
        setIsSidePanelOpen={setIsSidePanelOpen}
      />
    </>
  );
}

export default App;
