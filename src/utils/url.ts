import * as L from 'leaflet';
import { Raster, WMS, LatLng, Layercollection, Location, Scenario } from "../interface";
import { baseUrl } from "../api";
import { getIdFromUrl } from './getUuidFromUrl';
import { getBounds, getCenterPoint, zoomLevelCalculation } from './latLngZoomCalculation';
import moment from "moment";

// Helper function to get short UUID
const getShortUuid = (uuid: string) => {
    return uuid.substring(0, 7);
};

export const openRasterInAPI = (raster: Raster) => {
    window.open(`/api/v4/rasters/${raster.uuid}`)
};

export const openWMSInAPI = (wms: WMS) => {
    window.open(`/api/v4/wmslayers/${wms.uuid}`)
};

export const openScenarioInAPI = (scenario: Scenario) => {
    window.open(`/api/v4/scenarios/${scenario.uuid}`)
};

export const openTimeseriesInAPI = (timeseriesUUIDs: string[]) => {
    // Temporarily open the collection of timeseries in API v3 as it is
    // for now not possible to open multiple selected timeseries in API v4
    window.open(`/api/v4/timeseries/?uuid__in=${timeseriesUUIDs.join(',')}`)
};

// Helper function to construct URL for multi-point selection
const constructObjectUrl = async (locations: Location[]) => {
    const urls = await Promise.all(locations.map(async location => {
        const objectType = location.object.type;
        const objectId = location.object.id;

        // check if object is nested asset
        // currently, we know there are 2 cases of nested asset
        // case 1 is filter with parent asset of groundwater_station
        // case 2 is pump with parent asset of pump_station
        let parentAssetType: string | null = null;
        let parentAssetId: number | null = null;

        if (objectType === 'filter') {
            parentAssetType = 'groundwaterstation'; // parent asset of filter is groundwater_station
            const parentAssetUrl = await fetch(`/api/v3/filters/${objectId}/`, {
                credentials: "same-origin",
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then(
                res => res.json()
            ).then(
                asset => asset.groundwater_station
            );
            parentAssetId = getIdFromUrl(parentAssetUrl);
        } else if (objectType === 'pump') {
            parentAssetType = 'pumpstation'; // parent asset of pump is pump_station
            const parentAssetUrl = await fetch(`/api/v3/pumps/${objectId}/`, {
                credentials: "same-origin",
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then(
                res => res.json()
            ).then(
                asset => asset.pump_station
            );
            parentAssetId = getIdFromUrl(parentAssetUrl);
        };

        if (parentAssetType && parentAssetId) {
            return `${parentAssetType}$${parentAssetId}`;
        } else {
            return `${objectType}$${objectId}`;
        };
    }));

    return urls.join('+');
};

export const openLocationsInLizard = async (locations: Location[], start: number | null, end: number | null) => {
    // Filter out locations with no geometry information
    const locationsWithCoordinates = locations.filter(location => location.geometry !== null);

    // Get center point of all selected locations
    const arrayOfCoordinates = locationsWithCoordinates.map(location => location.geometry!.coordinates);
    const bounds = new L.LatLngBounds(arrayOfCoordinates);
    const centerPoint = bounds.getCenter();

    // Construct url for multi-point selection
    const objectUrl = await constructObjectUrl(locationsWithCoordinates);

    const url = locationsWithCoordinates.length ? (
        `/viewer/nl/charts/topography/multi-point/${objectUrl}/@${centerPoint.lat},${centerPoint.lng},14/`
    ) : (
        `/viewer/nl/charts/topography/multi-point/${objectUrl}/`
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
    window.open(`/viewer/nl/map/topography,raster$${getShortUuid(raster.uuid)}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openWMSInLizard = (wms: WMS, centerPoint: LatLng, zoom: number) => {
    window.open(`/viewer/nl/map/topography,wmslayer$${getShortUuid(wms.uuid)}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openScenarioInLizard = (scenario: Scenario) => {
    window.open(`/viewer/nl/map/topography,scenario$${getShortUuid(scenario.uuid)}`);
};

export const openAllInLizard = (rasters: Raster[], wmsLayers: WMS[], scenarios: Scenario[]) => {
    // Get the last selected raster in the basket or last selected WMS layer if there is no raster
    let lastSelectedObject: Raster | WMS | null = null;

    // The first item in the rasters/WMS layers array is the last selected object
    if (rasters.length > 0) {
        lastSelectedObject = rasters[0];
    } else if (wmsLayers.length > 0) {
        lastSelectedObject = wmsLayers[0];
    };

    // Get the spatial bounds of the last selected object,
    // if lastSelectedObject is null then set it to the global map
    const bounds = lastSelectedObject ? getBounds(lastSelectedObject) : {
        north: 85, east: 180, south: -85, west: -180
    };

    // Get the center point based on its spatial bounds
    const centerPoint: LatLng = getCenterPoint(bounds);

    // Calculate the zoom level by using the zoomLevelCalculation function
    const zoom = zoomLevelCalculation(bounds);

    // create arrays of short ID of all the rasters, scenarios and WMS layers in the basket
    const rasterIddArray = rasters.map(raster => getShortUuid(raster.uuid));
    const wmsIdArray = wmsLayers.map(wms => getShortUuid(wms.uuid));
    const scenarioIdArray = scenarios.map(scenario => getShortUuid(scenario.uuid));

    // create the url path to display all the rasters, scenarios and WMS layers in the basket on the map
    // the format of the url is something like: ',raster$rasterID1,raster$rasterID2,...,wmslayer$wmsLayerID1,...,scenario$scenarioID1,...'
    const urlPathForRaster = rasterIddArray.map(id => `,raster$${id}`).join('');
    const urlPathForWMSLayer = wmsIdArray.map(id => `,wmslayer$${id}`).join('');
    const urlPathForScenario = scenarioIdArray.map(id => `,scenario$${id}`).join('');

    window.open(`/viewer/nl/map/topography${urlPathForRaster}${urlPathForWMSLayer}${urlPathForScenario}/point/@${centerPoint.lat},${centerPoint.lng},${zoom}`);
};

export const openWMSDownloadURL = (wms: WMS) => {
    return wms.download_url ? window.open(wms.download_url) : null;
};

export const getRasterGetCapabilitesURL = (raster: Raster) => {
    return `${baseUrl}/wms/raster_${raster.uuid}/?request=GetCapabilities`;
};

export const getScenarioGetCapabilitesURL = (scenario: Scenario) => {
    return `${baseUrl}/wms/scenario_${scenario.uuid}/?request=GetCapabilities`;
};

export const getLayercollectionGetCapabilitesURL = (layercollection: Layercollection) => {
    return layercollection && `${baseUrl}/wms/${layercollection.slug}/?request=GetCapabilities`;
};

export const requestTimeseriesExport = (timeseriesUUIDs: string[], start: number, end: number | null) => {
    const startDateTimeInUTC = moment(start).utc().format("YYYY-MM-DDTHH:mm");
    const params: string[] = ['notify_user=true', `start=${startDateTimeInUTC}Z`];

    if (end) {
        const endDateTimeInUTC = moment(end).utc().format("YYYY-MM-DDTHH:mm");
        params.push(`end=${endDateTimeInUTC}Z`);
    } else {
        // get current time in UTC as end time
        params.push(`end=${moment().utc().format("YYYY-MM-DDTHH:mm")}Z`);
    };

    // Add UUIDs of timeseries to params
    // since timeseries UUIDs is a 2 dimension array, we first need to flatten it and then remove duplicates if any
    const newTimeseriesUUIDs: string[] = Array.prototype.concat.apply([], timeseriesUUIDs);
    const uniqueTimeseriesUUIDs = [...new Set(newTimeseriesUUIDs)];
    uniqueTimeseriesUUIDs.map(uuid => params.push(`uuid=${uuid}`));

    const queries = params.join('&');

    const url = `/api/v4/timeseries/export/?${queries}`;

    // Send GET request to timeseries endpoint for exporting task
    return fetch(url);
};