import {
    RASTERS_FETCHED,
    RASTER_SELECTED,
    BASKET_UPDATED,
    ITEM_REMOVED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP,
    SWITCH_VIEW,
    RECEIVE_WMS,
    REQUEST_WMS,
    SELECT_WMS
} from "./action";

//ACTION INTERFACE
export interface RequestLizardBootstrap {
    type: typeof REQUEST_LIZARD_BOOTSTRAP
};

export interface ReceiveLizardBootstrap {
    type: typeof RECEIVE_LIZARD_BOOTSTRAP,
    payload: Bootstrap
};

export interface SwitchView {
    type: typeof SWITCH_VIEW
};

export type BootstrapActionType = RequestLizardBootstrap | ReceiveLizardBootstrap | SwitchView;

export interface RastersRequested {
    type: typeof RASTERS_REQUESTED
};

export interface RastersFetched {
    type: typeof RASTERS_FETCHED,
    payload: RasterListObject
};

export interface RasterSelected {
    type: typeof RASTER_SELECTED,
    payload: string
};

export type RasterActionType = RastersRequested | RastersFetched | RasterSelected;

export interface RequestWMS {
    type: typeof REQUEST_WMS
};

export interface ReceiveWMS {
    type: typeof RECEIVE_WMS,
    payload: WMSObject
};

export interface SelectWMS {
    type: typeof SELECT_WMS,
    payload: string
};

export type WMSActionType = RequestWMS | ReceiveWMS | SelectWMS;

export interface BasketAdded {
    type: typeof BASKET_UPDATED,
    payload: string[]
};

export interface ItemRemoved {
    type: typeof ITEM_REMOVED,
    payload: string
};

export type Basket = BasketAdded | ItemRemoved;

export interface ObservationTypesFetched {
    type: typeof OBSERVATION_TYPES_FETCHED,
    payload: ObservationType[]
};

export interface OrganisationsFetched {
    type: typeof ORGANISATIONS_FETCHED,
    payload: Organisation[]
};

export type FilterActionType = ObservationTypesFetched | OrganisationsFetched;

//LIZARD BOOTSTRAP
export interface Bootstrap {
    user: {
        first_name: string | null,
        username: string | null,
        authenticated: boolean
    },
    isFetching: boolean,
    viewWMS: boolean 
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
    organisation: Organisation,
    access_modifier: string
};

//ORGANISATION
export interface Organisation {
    url: string,
    name: string,
    uuid: string,
    checked: boolean
};

//OBSERVATION TYPE
export interface ObservationType {
    url: string,
    code: string,
    parameter: string,
    unit: string,
    scale: string,
    description: string,
    checked: boolean
};

export interface LatLng {
    lat: number,
    lng: number
};