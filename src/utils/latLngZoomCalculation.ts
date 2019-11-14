import * as L from 'leaflet';
import { Raster, WMS } from '../interface';

//Determine the Lat and Long of the center point of the raster/WMS layer on the map
export const getCenterPoint = (bounds: Raster['spatial_bounds']) => {
    const { north, east, south, west } = bounds;
    const spatialBounds = L.latLngBounds([north, east], [south, west]);
    return spatialBounds.getCenter();
};

//Get the zoom level based on spatial bounds
//Get reference from stackoverflow on how to calculate the zoom level: 
//https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
export const zoomLevelCalculation = (bounds: Raster['spatial_bounds']) => {
    const { north, east, south, west } = bounds;
    const GLOBE_WIDTH = 256; //a constant in Google's map projection
    let angle = east - west;
    if (angle < 0) angle += 360;
    let angle2 = north - south;
    if (angle2 > angle) angle = angle2;
    return Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
};

//Get spatial bounds for the raster/WMS layer
export const getBounds = (object: Raster | WMS) => {
    //If spatial_bounds is null then set the projection
    //to the whole globe which is at [[85, 180], [-85, -180]]
    const bounds = object.spatial_bounds ? object.spatial_bounds : {
        north: 85, east: 180, south: -85, west: -180
    };
    return bounds;
};

//Get the bounds format to display on the map as [[north, east], [south, west]]
export const boundsToDisplay = (bounds: Raster['spatial_bounds']) => {
    const { north, east, south, west } = bounds;
    return [[north, east], [south, west]];
};