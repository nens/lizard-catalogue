import * as L from 'leaflet';
import { Raster, WMS, LatLng, Dataset, Location } from "../interface";
import { baseUrl } from "../api";
import moment from "moment";

export const openRasterInAPI = (raster: Raster) => {
    window.open(`/api/v4/rasters/${raster.uuid}`)
};

export const openWMSInAPI = (wms: WMS) => {
    window.open(`/api/v4/wmslayers/${wms.uuid}`)
};

export const openTimeseriesInAPI = (timeseriesUUIDs: string[][]) => {
    // Temporarily open the collection of timeseries in API v3 as it is
    // for now not possible to open multiple selected timeseries in API v4
    window.open(`/api/v4/timeseries/?uuid__in=${timeseriesUUIDs.join(',')}`)
};

export const openLocationsInLizard = (locations: Location[], start: number | null, end: number | null) => {
    // Filter out locations with no geometry information
    const locationsWithCoordinates = locations.filter(location => location.geometry !== null);

    // Get center point of all selected locations
    const arrayOfCoordinates = locationsWithCoordinates.map(location => location.geometry!.coordinates);
    const bounds = new L.LatLngBounds(arrayOfCoordinates);
    const centerPoint = bounds.getCenter();

    // Construct url for multi-point selection
    const objectUrl = locations.map(location => `${location.object.type}$${location.object.id}`).join('+');
    const url = locationsWithCoordinates.length ? (
        `/nl/charts/topography/multi-point/${objectUrl}/@${centerPoint.lat},${centerPoint.lng},14/`
    ) : (
        `/nl/charts/topography/multi-point/${objectUrl}/`
    );
    if (!start) {
        // Open locations in chart mode to view the timeseries without duration
        return window.open(url);
    };

    const startDate = moment(start).format("MMM,DD,YYYY");
    const endDate = end ? moment(end).format("MMM,DD,YYYY") : moment().format("MMM,DD,YYYY");
    const duration = `${startDate}-${endDate}`;

    // Open locations in chart mode to view the timeseries with duration
    return window.open(url + duration);
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

export const requestTimeseriesExport = (timeseriesUUIDs: string[][], start: number | null, end: number | null) => {
    if (!start) return; // export cannot happen if no start date is selected

    const params: string[] = ['async=true', 'format=xlsx', 'interactive=true', `uuid=${timeseriesUUIDs.join(',')}`, `start=${start}`];

    if (end) {
        params.push(`end=${end}`);
    } else {
        params.push(`end=${moment().valueOf()}`);
    };

    const queries = params.join('&');

    const url = `/api/v3/timeseries/?${queries}`;

    // Send GET request to timeseries endpoint for exporting task
    return fetch(url).catch(console.error);
};