import { Raster, WMS, LatLng, Dataset } from "../interface";
import { baseUrl } from "../api";

export const openRasterInAPI = (raster: Raster) => {
    window.open(`/api/v4/rasters/${raster.uuid}`)
};

export const openWMSInAPI = (wms: WMS) => {
    window.open(`/api/v4/wmslayers/${wms.uuid}`)
};

export const openTimeseriesInAPI = (uuid: string) => {
    window.open(`/api/v4/timeseries/${uuid}`, uuid)
};

export const openRasterInLizard = (raster: Raster, centerPoint: LatLng, zoom: number) => {
    //create short UUID of the raster
    const rasterShortUUID = raster.uuid.substr(0, 7);
    
    window.open(`/nl/map/topography,raster$${rasterShortUUID}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openWMSInLizard = (wms: WMS, centerPoint: LatLng, zoom: number) => {
    //create short UUID of the WMS layer
    const wmsShortUUID = wms.uuid.substr(0, 7);

    window.open(`/nl/map/topography,wmslayer$${wmsShortUUID}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openAllInLizard = (rasters: Raster[], centerPoint: LatLng, zoom: number, wmsLayers: WMS[]) => {
    //create arrays of short ID of all the rasters and WMS layers in the basket
    const rasterIddArray = rasters.map(raster => raster.uuid.substr(0, 7));
    const wmsIdArray = wmsLayers.map(wms => wms.uuid.substr(0, 7));

    //create the url path to display all the rasters and WMS layers in the basket on the map
    //the format of the url is something like: ',raster$rasterID1,raster$rasterID2,...,wmslayer$wmsLayerID1,...'
    const urlPathForRaster = rasterIddArray.map(id => `,raster$${id}`).join('');
    const urlPathForWMSLayer = wmsIdArray.map(id => `,wmslayer$${id}`).join('');

    window.open(`/nl/map/topography${urlPathForRaster}${urlPathForWMSLayer}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openWMSDownloadURL = (wms: WMS) => {
    return wms.download_url ? window.open(wms.download_url) : null;
};

export const getRasterGetCapabilitesURL = (raster: Raster) => {
    return `${baseUrl}/wms/raster_${raster.uuid}/?request=GetCapabilities`;
};

export const getDatasetGetCapabilitesURL = (dataset: Dataset) => {
    return dataset && `${baseUrl}/wms/${dataset.slug}/?request=GetCapabilities`;
};

export const requestTimeseriesExport = (uuid: string, start: number, end: number) => {
    const url = `/api/v3/timeseries/?async=true&format=xlsx&uuid=${uuid}&start=${start}&end=${end}&interactive=true`;

    // Send GET request to timeseries endpoint for exporting task
    fetch(url).catch(console.error);
};