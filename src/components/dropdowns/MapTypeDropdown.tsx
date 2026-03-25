import type { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  mapType: string;
  setMapType: Dispatch<SetStateAction<string>>;
};

export default function MapTypeDropdown({ mapType, setMapType }: Props) {
  return (
    <Select value={mapType} onValueChange={(value) => setMapType(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Types" />
      </SelectTrigger>
      <SelectContent className="z-1001">
        {types.map((city, i) => (
          <SelectItem key={i} value={city} className="capitalize">
            {city.split("_")[0]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const types = [
  "clouds_new",
  "precipitation_new",
  "pressure_new",
  "wind_new",
  "temp_new",
];
