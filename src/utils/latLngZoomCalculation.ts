import * as L from 'leaflet';

//Determine the Lat and Long of the center point of the raster on the map
export const getCenterPoint = (north: number, east: number, south: number, west: number) => {
    const bounds = L.latLngBounds([north, east], [south, west]);
    return bounds.getCenter();
};

//Get the zoom level based on 4 spatial bounds
//Get reference from stackoverflow on how to calculate the zoom level: 
//https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
export const zoomLevelCalculation = (north: number, east: number, south: number, west: number) => {

    const GLOBE_WIDTH = 256; //a constant in Google's map projection
    let angle = east - west;
    if (angle < 0) angle += 360;
    let angle2 = north - south;
    if (angle2 > angle) angle = angle2;

    return Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2);
};