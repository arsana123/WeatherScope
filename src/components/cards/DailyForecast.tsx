import { useSuspenseQuery } from "@tanstack/react-query";
import { getWeather } from "../../api";
import type { Coords } from "../../types";
import WeatherIcons from "../WeatherIcons";
import Card from "./Card";

type Props = {
  coords: Coords;
};

const DailyForecast = ({ coords }: Props) => {
  const { data } = useSuspenseQuery({
    queryKey: ["weather", coords],
    queryFn: () => getWeather({ lat: coords.lat, long: coords.long }),
  });

  return (
    <>
      <Card title="Daily Forecast" childrenClassName="flex flex-col gap-4 2xl:justify-between">
        {data?.daily.map((day) => (
          <div key={day.dt} className="flex justify-between">
            <p className="w-9">
              {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                weekday: "short",
              })}
            </p>
            <WeatherIcons src={day?.weather[0].icon} />
            <p>{Math.round(day.temp.day)}°C</p>
            <p className="text-gray-500/75">{Math.round(day.temp.max)}°C</p>
            <p className="text-gray-500/75">{Math.round(day.temp.min)}°C</p>
          </div>
        ))}
      </Card>
    </>
  );
};

export default DailyForecast;
