import {
    RASTERS_FETCHED,
    BASKET_UPDATED,
    ITEM_REMOVED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    DATASETS_FETCHED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP,
    RECEIVE_WMS,
    REQUEST_WMS,
    SWITCH_DATA_TYPE,
    ITEM_SELECTED,
    UPDATE_ORGANISATION_RADIOBUTTON,
    UPDATE_OBSERVATION_RADIOBUTTON,
    UPDATE_DATASET_RADIOBUTTON,
    TOGGLE_ALERT,
} from "./action";

//ACTION INTERFACE
export interface RequestLizardBootstrap {
    type: typeof REQUEST_LIZARD_BOOTSTRAP
};

export interface ReceiveLizardBootstrap {
    type: typeof RECEIVE_LIZARD_BOOTSTRAP,
    payload: Bootstrap
};

export type BootstrapActionType = RequestLizardBootstrap | ReceiveLizardBootstrap;

export interface SwitchDataType {
    type: typeof SWITCH_DATA_TYPE,
    payload: "Raster" | "WMS"
};

export interface ToggleAlert {
    type: typeof TOGGLE_ALERT
};

export interface RastersRequested {
    type: typeof RASTERS_REQUESTED
};

export interface RastersFetched {
    type: typeof RASTERS_FETCHED,
    payload: RasterListObject
};

export type RasterActionType = RastersRequested | RastersFetched | ToggleAlert;

export interface RequestWMS {
    type: typeof REQUEST_WMS
};

export interface ReceiveWMS {
    type: typeof RECEIVE_WMS,
    payload: WMSObject
};

export type WMSActionType = RequestWMS | ReceiveWMS | ToggleAlert;

export interface ItemSelected {
    type: typeof ITEM_SELECTED,
    payload: string
}

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

export interface DatasetsFetched {
    type: typeof DATASETS_FETCHED,
    payload: Dataset[]
};

export type FilterActionType = ObservationTypesFetched | OrganisationsFetched | DatasetsFetched;

export interface UpdateOrganisationRadiobutton {
    type: typeof UPDATE_ORGANISATION_RADIOBUTTON,
    payload: Organisation['name']
};

export interface UpdateObservationTypeRadiobutton {
    type: typeof UPDATE_OBSERVATION_RADIOBUTTON,
    payload: ObservationType['parameter']
};

export interface UpdateDatasetRadiobutton {
    type: typeof UPDATE_DATASET_RADIOBUTTON,
    payload: Dataset['slug']
};

export type UpdateRadiobuttonActionType = UpdateOrganisationRadiobutton | UpdateObservationTypeRadiobutton | UpdateDatasetRadiobutton;

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
    dataset: Dataset,
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
    dataset: Dataset,
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

//DATASET
export interface Dataset {
    slug: string,
    organisation: {
        url: string,
        name: string,
        uuid: string
    },
    checked: boolean
};

export interface LatLng {
    lat: number,
    lng: number
};