import * as L from 'leaflet';
import { Raster, WMS } from '../interface';

//Get the zoom level based on spatial bounds
//Get reference from stackoverflow on how to calculate the zoom level:
//https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
export const zoomLevelCalculation = (bounds: L.LatLngBounds) => {
  const north = bounds.getNorth();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const west = bounds.getWest();
    const GLOBE_WIDTH = 256; //a constant in Google's map projection
    let angle = east - west;
    if (angle < 0) angle += 360;
    let angle2 = north - south;
    if (angle2 > angle) angle = angle2;
    return Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
};

//Get spatial bounds for the raster/WMS layer
export const getBounds = (object: Raster | WMS | null): L.LatLngBounds => {
    //If spatial_bounds is null then set the projection
    //to the whole globe which is at [[85, 180], [-85, -180]]
    const bounds = (object && object.spatial_bounds) ? object.spatial_bounds : {
        north: 85, east: 180, south: -85, west: -180
    };
  return new L.LatLngBounds(
    [bounds.north, bounds.west], [bounds.south, bounds.east]
  );
};
