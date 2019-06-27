import { Raster } from "../interface";
import { PROXY_SERVER } from "../api";

export const openRasterInAPI = (raster: Raster) => {
    window.open(`${PROXY_SERVER}/api/v4/rasters/${raster.uuid}`)
};

export const openRasterInLizard = (raster: Raster, rasterLong: number, rasterLat: number, zoom: number) => {
    window.open(`${PROXY_SERVER}/nl/map/topography,raster$${raster.uuid.substr(0, 7)}/point/@${rasterLong},${rasterLat},${zoom}`)
};

export const openRastersInLizard = (urlPath: string, rasterLong: number, rasterLat: number, zoom: number) => {
    window.open(`${PROXY_SERVER}/nl/map/topography${urlPath}/point/@${rasterLong},${rasterLat},${zoom}`);
};