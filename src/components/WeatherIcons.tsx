import clsx from "clsx";

type Props = {
  src: string;
  customClassName?: string;
};

const WeatherIcons = ({ src, customClassName }: Props) => {
  return (
    <img
      className={clsx("size-8", customClassName)}
      src={`https://openweathermap.org/img/wn/${src}.png`}
      alt="Weather Icon"
    />
  );
};

export default WeatherIcons;
