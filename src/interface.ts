import { RASTERS_FETCHED, RASTER_SELECTED } from "./action";

//REDUX STORE INTERFACE
export interface MyStore {
    rasters: Raster[] | null;
    selectedRaster: Raster | null;
};

//ACTION INTERFACE
export interface RastersFetched {
    type: typeof RASTERS_FETCHED;
    payload: Raster[];
};

export interface RasterSelected {
    type: typeof RASTER_SELECTED;
    payload: Raster;
};

export type RasterActionType = RastersFetched | RasterSelected;

//INTERFACES
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
    data_type: string;
    resolution: string;
    wms_info: {
        endpoint: string;
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
};

export interface ObservationType {
    url: string;
    code: string;
    parameter: string;
    unit: string;
    scale: string;
    description: string;
};