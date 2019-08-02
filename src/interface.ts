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
    SWITCH_DATA_TYPE
} from "./action";

//ACTION INTERFACE
export interface RequestLizardBootstrap {
    type: typeof REQUEST_LIZARD_BOOTSTRAP
};

export interface ReceiveLizardBootstrap {
    type: typeof RECEIVE_LIZARD_BOOTSTRAP,
    payload: Bootstrap
};

export interface SwitchDataType {
    type: typeof SWITCH_DATA_TYPE,
    payload: string
};

export type BootstrapActionType = RequestLizardBootstrap | ReceiveLizardBootstrap | SwitchDataType;

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

//INTERFACES
export interface Bootstrap {
    user: {
        first_name: string | null,
        username: string | null,
        authenticated: boolean
    },
    isFetching: boolean
};

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

export interface Organisation {
    url: string,
    name: string,
    uuid: string,
    checked: boolean
};

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