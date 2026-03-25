import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeather } from "../../api";
import type { Coords } from "../../types";
import WeatherIcons from "../WeatherIcons";
import Card from "./Card";

type Props = {
  coords: Coords;
};

const CurrentWeather = ({ coords }: Props) => {
  const { data } = useSuspenseQuery({
    queryKey: ["weather", coords],
    queryFn: () => getWeather({ lat: coords.lat, long: coords.long }),
  });
  return (
    <>
      <Card
        title="Current Weather"
        childrenClassName="flex flex-col items-center gap-6 2xl:justify-between"
      >
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-6xl font-semibold text-center">
            {Math.round(data?.current.temp)}°C
          </h2>
          <WeatherIcons
            src={data?.current.weather[0].icon}
            customClassName="size-20"
          />
          <h3 className="capitalize text-xl">
            {data?.current.weather[0].description}
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xl text-center">Local Time:</p>
          <h3 className="text-4xl font-semibold">
            {new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: data?.timezone,
            }).format(new Date(data!.current.dt * 1000))}
          </h3>
        </div>

        <div className="flex justify-between w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Feels Like</p>
            <p>{Math.round(data?.current.feels_like)}°C</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Humidity</p>
            <p>{data?.current.humidity}%</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500">Wind</p>
            <p>{data?.current.wind_speed} m/s</p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CurrentWeather;
