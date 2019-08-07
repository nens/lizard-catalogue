import { Raster, WMS, LatLng } from "../interface";

export const openRasterInAPI = (raster: Raster) => {
    window.open(`/api/v4/rasters/${raster.uuid}`)
};

export const openWMSInAPI = (wms: WMS) => {
    window.open(`/api/v4/wmslayers/${wms.uuid}`)
};

export const openRastersInLizard = (basket: Raster[], centerPoint: LatLng, zoom: number) => {
    //create an array of short ID of all the rasters in the basket
    const idArray = basket.map(raster => raster.uuid.substr(0, 7));

    //create the url path to display all the rasters in the basket on the map
    //the format of the url is something like: ',raster$rasterID1,raster$rasterID2,...,raster$rasterIDn'
    const urlPath = idArray.map(id => `,raster$${id}`).join('');
    
    window.open(`/nl/map/topography${urlPath}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openWMSInLizard = (wms: WMS) => {
    //create short UUID of the WMS layer
    const wmsShortUUID = wms.uuid.substr(0, 7);

    window.open(`/nl/map/topography,wmslayer$${wmsShortUUID}`);
};