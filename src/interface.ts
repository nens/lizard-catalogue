import { RASTERS_FETCHED, RASTER_SELECTED, BASKET_UPDATED, ITEM_REMOVED, OBSERVATION_TYPES_FETCHED, ORGANISATIONS_FETCHED } from "./action";

//ACTION INTERFACE
export interface RastersFetched {
    type: typeof RASTERS_FETCHED;
    payload: RasterListObject;
};

export interface RasterSelected {
    type: typeof RASTER_SELECTED;
    payload: string;
};

export type RasterActionType = RastersFetched | RasterSelected;

export interface BasketAdded {
    type: typeof BASKET_UPDATED;
    payload: string[];
};

export interface ItemRemoved {
    type: typeof ITEM_REMOVED;
    payload: string;
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
export interface RasterListObject {
    count: number;
    previous: string;
    next: string;
    results: Raster[];
};

export interface Raster {
    uuid: string;
    name: string;
    organisation: Organisation;
    observation_type: ObservationType;
    description: string;
    temporal: boolean;
    interval: string;
    first_value_timestamp: string;
    last_value_timestamp: string;
    last_modified: string;
    projection: string;
    pixelsize_x: number;
    pixelsize_y: number;
    wms_info: {
        endpoint: string;
        layer: string;
    };
    spatial_bounds: {
        west: number;
        east: number;
        north: number;
        south: number;
    };
};

export interface Organisation {
    url: string;
    name: string;
    uuid: string;
    checked: boolean
};

export interface ObservationType {
    url: string;
    code: string;
    parameter: string;
    unit: string;
    scale: string;
    description: string;
};