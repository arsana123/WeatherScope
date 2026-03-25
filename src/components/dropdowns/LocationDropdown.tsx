import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Dispatch, type SetStateAction } from "react";

type Props = {
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
};

export default function LocationDropdown({ location, setLocation }: Props) {
  return (
    <div>
      <Select value={location} onValueChange={(value) => setLocation(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Locations" />
        </SelectTrigger>
        <SelectContent className="z-1001">
          {location === "custom" && (
            <SelectItem value="custom" className="capitalize">
              Custom
            </SelectItem>
          )}
          {locations.map((city, i) => (
            <SelectItem key={i} value={city} className="capitalize">
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const locations = [
  "New York",
  "London",
  "Delhi",
  "Mumbai",
  "Kolkata",
  "Tokyo",
  "Sydney",
  "Paris",
  "Berlin",
  "Moscow",
  "Rio de Janeiro",
  "Cape Town",
  "Beijing",
];
