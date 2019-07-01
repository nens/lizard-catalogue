import { Raster, LatLng } from "../interface";
import { PROXY_SERVER } from "../api";

export const openRasterInAPI = (raster: Raster) => {
    window.open(`${PROXY_SERVER}/api/v4/rasters/${raster.uuid}`)
};

export const openRastersInLizard = (basket: Raster[], centerPoint: LatLng, zoom: number) => {
    //create an array of short ID of all the rasters in the basket
    const idArray = basket.map(raster => raster.uuid.substr(0, 7));

    //create the url path to display all the rasters in the basket on the map
    //the format of the url is something like: ',raster$rasterID1,raster$rasterID2,...,raster$rasterIDn'
    const urlPath = idArray.map(id => `,raster$${id}`).join('');
    
    window.open(`${PROXY_SERVER}/nl/map/topography${urlPath}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};