import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeather } from "../../api";
import type { Coords } from "../../types";
import WeatherIcons from "../WeatherIcons";
import Card from "./Card";

type Props = {
  coords: Coords;
};

const HourlyForecast = ({ coords }: Props) => {
  const { data } = useSuspenseQuery({
    queryKey: ["weather", coords],
    queryFn: () => getWeather({ lat: coords.lat, long: coords.long }),
  });
  return (
    <Card
      title="Hourly Forecast (48 hours)"
      childrenClassName="flex gap-6 overflow-x-auto"
    >
      {data?.hourly.map((hour) => (
        <div
          key={hour.dt}
          className="flex flex-col gap-2 items-center p-2 2xl:justify-between"
        >
          <p className="whitespace-nowrap 2xl:scale-110">
            {new Date(hour.dt * 1000).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          <WeatherIcons
            customClassName={"2xl:size-10"}
            src={hour?.weather[0].icon}
          />
          <p className="2xl:scale-110">{Math.round(hour.temp)}°C</p>
        </div>
      ))}
    </Card>
  );
};

export default HourlyForecast;
