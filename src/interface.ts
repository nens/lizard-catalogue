import {
    SWITCH_DATA_TYPE,
} from "./action";

//ACTION
export interface SwitchDataType {
    type: typeof SWITCH_DATA_TYPE,
    payload: "Raster" | "WMS"
};

//LIZARD BOOTSTRAP
export interface Bootstrap {
    user: {
        first_name: string | null,
        username: string | null,
        authenticated: boolean
    },
    isFetching: boolean
};

//RASTER
export interface RasterListObject {
    count: number,
    previous: string,
    next: string,
    results: Raster[]
};

export interface Raster {
    uuid: string,
    name: string,
    organisation: Organisation,
    observation_type: ObservationType,
    datasets: Dataset[],
    description: string,
    temporal: boolean,
    interval: string,
    first_value_timestamp: string,
    last_value_timestamp: string,
    last_modified: string,
    projection: string,
    pixelsize_x: number,
    pixelsize_y: number,
    access_modifier: string,
    wms_info: {
        endpoint: string,
        layer: string
    },
    spatial_bounds: {
        west: number,
        east: number,
        north: number,
        south: number
    },
    options: {
        styles: string
    }
};

//WMS
export interface WMSObject {
    count: number,
    previous: string,
    next: string,
    results: WMS[]
};

export interface WMS {
    uuid: string,
    name: string,
    description: string,
    slug: string,
    get_feature_info: boolean,
    get_feature_info_url: string,
    legend_url: string,
    min_zoom: number,
    max_zoom: number,
    url: string,
    wms_url: string,
    organisation: Organisation,
    datasets: Dataset[],
    access_modifier: string,
    download_url: string | null,
    spatial_bounds: {
        west: number,
        east: number,
        north: number,
        south: number
    } | null,
};

//ORGANISATION
export interface Organisation {
    url: string,
    name: string,
    uuid: string,
};

//OBSERVATION TYPE
export interface ObservationType {
    url: string,
    code: string,
    parameter: string,
    unit: string,
    scale: string,
    description: string,
};

//DATASET
export interface Dataset {
    slug: string,
    organisation: {
        url: string,
        name: string,
        uuid: string
    },
};

export interface LatLng {
    lat: number,
    lng: number
};