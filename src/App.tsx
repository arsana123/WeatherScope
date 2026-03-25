import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { getGeoCode } from "./api";
import AdditionalInfo from "./components/cards/AdditionalInfo";
import CurrentWeather from "./components/cards/CurrentWeather";
import DailyForecast from "./components/cards/DailyForecast";
import HourlyForecast from "./components/cards/HourlyForecast";
import LocationDropdown from "./components/dropdowns/LocationDropdown";
import MapTypeDropdown from "./components/dropdowns/MapTypeDropdown";
import Map from "./components/Map";
import MapLegend from "./components/MapLegend";
import CurrentSkeleton from "./components/skeletons/CurrentSkeleton";
import DailySkeleton from "./components/skeletons/DailySkeleton";
import HourlySkeleton from "./components/skeletons/HourlySkeleton";
import type { Coords } from "./types";
import AdditionalInfoSkeleton from "./components/skeletons/AdditionalInfoSkeleton";
import SidePanel from "./components/SidePanel";
import Hamburger from "/src/assets/hamburger.svg?react";

function App() {
  const [coordinates, setCoordinates] = useState<Coords>({ lat: 0, long: 0 });

  const [location, setLocation] = useState<string>("Tokyo");
  const [mapType, setMapType] = useState<string>("clouds_new");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

  const { data: geoCodeData } = useQuery({
    queryKey: ["geocode", location],
    queryFn: () => getGeoCode(location),
  });

  const onMapClick = (newCoords: Coords) => {
    setCoordinates(newCoords);
    setLocation("custom");
  };

  const coords =
    location === "custom"
      ? coordinates
      : { lat: geoCodeData?.[0].lat ?? 0, long: geoCodeData?.[0].lon ?? 0 };

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
        <div className="grid grid-cols-1 2xl:flex-1 2xl:min-h-0 gap-4 md:grid-cols-2 2xl:grid-cols-4 2xl:grid-rows-4">
          <div className="relative h-120 2xl:h-auto col-span-1 md:col-span-2 2xl:col-span-4 2xl:row-span-2 order-1">
            <Map coords={coords} onMapClick={onMapClick} mapType={mapType} />
            <MapLegend mapType={mapType} />
          </div>
          <div className="col-span-1 2xl:row-span-2 order-2">
            <Suspense fallback={<CurrentSkeleton />}>
              <CurrentWeather coords={coords} />
            </Suspense>
          </div>
          <div className="col-span-1 order-3 2xl:order-4 2xl:row-span-2">
            <Suspense fallback={<DailySkeleton />}>
              <DailyForecast coords={coords} />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-2 2xl:row-span-1 order-4 2xl:order-3">
            <Suspense fallback={<HourlySkeleton />}>
              <HourlyForecast coords={coords} />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-2 2xl:row-span-1 order-5">
            <Suspense fallback={<AdditionalInfoSkeleton />}>
              <AdditionalInfo coords={coords} />
            </Suspense>
          </div>
        </div>
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
