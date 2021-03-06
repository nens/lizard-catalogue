import {
    SWITCH_DATA_TYPE,
    REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
    REQUESTED_RASTER_EXPORT_GRIDCELLS,
    RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    REMOVE_ALL_EXPORT_GRID_CELLS,
    REQUEST_RASTER_EXPORTS,
    RECEIVED_TASK_RASTER_EXPORT,
    FAILED_TASK_RASTER_EXPORT,
    RECEIVED_PROJECTIONS,
    FETCHING_STATE_PROJECTIONS,
    SET_RASTER_EXPORT_FORM_FIELDS,
} from "./action";
import { MyStore } from './reducers';

//ACTION
export interface SwitchDataType {
    type: typeof SWITCH_DATA_TYPE,
    payload: "Raster" | "WMS" | "Timeseries"
};

//LIZARD BOOTSTRAP
export interface Bootstrap {
    user: {
        id: number | null,
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

// MONITORING NETWORK FOR TIMESERIES
export interface MonitoringNetworkObject {
    count: number,
    previous: string,
    next: string,
    results: MonitoringNetwork[]
};

export interface MonitoringNetwork {
    url: string,
    uuid: string,
    name: string,
    organisation: Organisation,
    access_modifier: string,
    supplier: string,
    num_timeseries: number,
    description: string,
}

// TIMESERIES
export interface TimeSeries {
    url: string,
    uuid: string,
    code: string,
    name: string,
    description: string,
    observation_type: ObservationType,
    location: Location,
}

export interface Location {
    url: string,
    uuid: string,
    code: string,
    name: string,
    geometry: {
        type: string,
        coordinates: [number, number],
    } | null,
    object: {
        id: number,
        type: string
    },
}

//ORGANISATION
export interface Organisation {
    url: string,
    name: string,
    uuid: string,
    roles: string[]
};

//OBSERVATION TYPE
export interface ObservationType {
    id: number,
    url: string,
    code: string,
    parameter: string,
    unit: string,
    scale: string,
    description: string,
    reference_frame: string | null,
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

//EXPORT MESSAGE
export interface Message {
    id: string,
    message: string,
    url: string,
    downloaded: boolean,
};

export type ExportGridCelId = number[];

export interface ExportGridCell {
    "type": string,
    "geometry": {
        type: string,
        coordinates: number[][],
    },
    "properties": {
        "projection": string,
        "bbox": number[],
        "id": ExportGridCelId
    }
};

export type FetchingState = "NOT_SENT" | "SENT" | "RECEIVED" | "FAILED";

export interface Bounds {
    north: number;
    east: number;
    south: number;
    west: number;
}

export interface RasterExportState {
    selectedGridCellIds: ExportGridCelId[],
    availableGridCells: ExportGridCell[],
    fetchingStateGrid: FetchingState,
    fetchingStateGridMsg: string,
    fetchingStateTasks: FetchingState,
    resolution: number | "",
    projection: string,
    tileWidth: number | "",
    tileHeight: number | "",
    bounds: Bounds,
    rasterExportRequests: RasterExportRequest[],
    dateTimeStart: string,
    numberOfinboxMessagesBeforeRequest: number,
    projectionsAvailableForCurrentRaster: Projections,
}

export interface Projections {
    fetchingState: FetchingState,
    projections: Projection[],
}

export interface Projection {
    url: string,
    name: string,
    code: string, 
}


export interface RemoveFromSelectedExportGridCellIds {
    type: typeof REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds: ExportGridCelId[],
};
export interface AddToSelectedExportGridCellIds { 
    type: typeof ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds: ExportGridCelId[],
};
export interface RemoveAllSelectedExportGridCellIds {
    type: typeof REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
};
export interface RemoveAllExportGridCells{
    type: typeof REMOVE_ALL_EXPORT_GRID_CELLS,
}
export interface RequestedGridCells {
    type: typeof REQUESTED_RASTER_EXPORT_GRIDCELLS,
};
export interface RetrievedRasterExportGridcells {
    type: typeof RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    gridCells: ExportGridCell[]

}

export interface  FailedRetrievingRasterExportGridcells {
    type: typeof FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    failedMsg: string,
}

export interface RequestRasterExports {
    type: typeof REQUEST_RASTER_EXPORTS,
    numberOfInboxMessages:number,
}
export interface ReceivedTaskRasterExport {
    type: typeof RECEIVED_TASK_RASTER_EXPORT,
    id: ExportGridCelId,
}

export interface FailedTaskRasterExport {
    type: typeof FAILED_TASK_RASTER_EXPORT,
    id: ExportGridCelId,
}

export interface ReceivedProjections {
    type: typeof RECEIVED_PROJECTIONS,
    projections: Projection[],
}
export interface SetFetchingStateProjections {
    type: typeof FETCHING_STATE_PROJECTIONS,
    fetchingState: FetchingState,
}
export interface SetRasterExportFormFields {
    type: typeof SET_RASTER_EXPORT_FORM_FIELDS,
    fieldValuePairs: FieldValuePair[],
}

export type RasterExportFormFieldType = 
    MyStore['rasterExportState']['resolution'] | 
    MyStore['rasterExportState']['projection'] |
    MyStore['rasterExportState']['tileWidth'] |
    MyStore['rasterExportState']['tileHeight'] |
    MyStore['rasterExportState']['bounds']


export interface FieldValuePair{field: string, value: RasterExportFormFieldType}

export type RasterExportStateActionType = 
    RemoveFromSelectedExportGridCellIds | 
    AddToSelectedExportGridCellIds | 
    RemoveAllSelectedExportGridCellIds | 
    RequestedGridCells| 
    RetrievedRasterExportGridcells | 
    FailedRetrievingRasterExportGridcells | 
    RemoveAllExportGridCells |
    RequestRasterExports | 
    ReceivedTaskRasterExport |
    FailedTaskRasterExport |
    ReceivedProjections |
    SetFetchingStateProjections |
    SetRasterExportFormFields ; 

export interface RasterExportRequest {
    fetchingState: FetchingState;
    id: ExportGridCelId;
    projection: string;
    bounds: Bounds;
    resolution: number | "";
    tileWidth: number | "";
    tileHeight: number | "";
}