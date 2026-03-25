import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { TileLayer } from "react-leaflet/TileLayer";
import type { Coords } from "../types";
import { useEffect } from "react";
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";

const API_key = import.meta.env.VITE_WEATHER_API_KEY;
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

type Props = {
  coords: Coords;
  onMapClick: (newCoords: Coords) => void;
  mapType: string;
};

export default function Map({ coords, onMapClick, mapType }: Props) {
  const { lat, long } = coords;

  return (
    <>
      <MapContainer
        center={[lat, long]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
      >
        <MapClick onMapClick={onMapClick} coords={coords} />
        <MapTileLayer />
        <TileLayer
          url={`https://tile.openweathermap.org/map/${mapType}/{z}/{x}/{y}.png?appid=${API_key}`}
        />
        <Marker position={[lat, long]} />
      </MapContainer>
    </>
  );
}

function MapClick({
  onMapClick,
  coords,
}: {
  onMapClick: (newCoords: Coords) => void;
  coords: Coords;
}) {
  const map = useMap();
  map.panTo([coords.lat, coords.long]);

  map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    onMapClick({ lat: lat, long: lng });
  });

  return null;
}

function MapTileLayer() {
  const map = useMap();

  useEffect(() => {
    const tileLayer = new MaptilerLayer({
      style: "basic-dark",
      apiKey: MAPTILER_API_KEY,
    });

    tileLayer.addTo(map);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map]);

  return null;
}
