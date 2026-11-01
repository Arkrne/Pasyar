"use client";

import { TileLayer } from "react-leaflet";

/*
  Raster terrain basemap (Esri World Topographic). Raster tiles move in lockstep with
  Leaflet's routes and markers while panning and zooming, so nothing drifts or "flies".
  Shaded relief and green landcover make the island feel alive.
*/
export function Basemap() {
  return (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a> &middot; Data &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
      maxZoom={17}
      detectRetina
    />
  );
}
