import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { TileLayer } from "react-leaflet/TileLayer";
import { MAPTILER_KEY, OWM_KEY } from "../config";
import type { Coords } from "../types";

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
        {MAPTILER_KEY ? (
          <MapTilerBase apiKey={MAPTILER_KEY} />
        ) : (
          // free dark basemap used when no MapTiler key is configured
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
          />
        )}
        {OWM_KEY && (
          <TileLayer
            url={`https://tile.openweathermap.org/map/${mapType}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
          />
        )}
        <Marker position={[lat, long]} />
      </MapContainer>
      {!OWM_KEY && (
        <p className="absolute bottom-2 left-2 z-1000 rounded-md bg-background/70 px-2 py-1 text-xs text-foreground">
          Weather map overlays need an OpenWeatherMap key (see README)
        </p>
      )}
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

  // move the map only when the location actually changes (not on every render)
  useEffect(() => {
    map.panTo([coords.lat, coords.long]);
  }, [map, coords.lat, coords.long]);

  // useMapEvents registers the handler once and removes it on unmount
  useMapEvents({
    click(e) {
      // wrap() keeps longitude within -180..180 when the map is panned around the globe
      const { lat, lng } = e.latlng.wrap();
      onMapClick({ lat, long: lng });
    },
  });

  return null;
}

function MapTilerBase({ apiKey }: { apiKey: string }) {
  const map = useMap();

  useEffect(() => {
    const tileLayer = new MaptilerLayer({ style: "basic-dark", apiKey });
    tileLayer.addTo(map);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map, apiKey]);

  return null;
}
