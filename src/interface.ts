import {
    RASTERS_FETCHED,
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
    REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
    REQUESTED_RASTER_EXPORT_GRIDCELLS,
    RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    SET_RASTER_EXPORT_FORM_FIELD,
    // SET_RASTER_EXPORT_BOUNDING_BOX,
    REMOVE_ALL_EXPORT_GRID_CELLS,
    // REQUESTED_RASTER_EXPORTS,
    // RECEIVED_TASKS_RASTER_EXPORTS,
    REQUEST_RASTER_EXPORTS,
    RECEIVED_TASK_RASTER_EXPORT,
    FAILED_TASK_RASTER_EXPORT,
} from "./action";
import { MyStore } from './reducers';
// import { number } from "prop-types";



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
};

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

//EXPORT MESSAGE
export interface Message {
    id: string,
    message: string,
    url: string,
    downloaded: boolean,
};

export type ExportGridCelId = number[];

export const areGridCelIdsEqual = (id1:ExportGridCelId, id2:ExportGridCelId): boolean => id1[0] == id2[0] && id1[1] == id2[1]
export const haveGridCellsSameId = (cell1:ExportGridCell, cell2:ExportGridCell): boolean => { 
    const id1 = cell1.properties.id;
    const id2 = cell2.properties.id;
    return areGridCelIdsEqual(id1, id2);
}

export interface ExportGridCell {
    "type": string,
    "geometry": {
        "type": string,
        "coordinates": number[][],
    },
    "properties": {
        "projection": string,
        "bbox": number[],
        "id": ExportGridCelId
    }
};

export type FetchingState = "NOT_SEND" | "SEND" | "RECEIVED" | "FAILED";

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
// export interface SetRasterExportResolution {
//     type: typeof SET_RASTER_EXPORT_RESOLUTION,
//     resolution: MyStore['rasterExportState']['resolution'],
// }
export interface SetRasterExportFormField {
    type: typeof SET_RASTER_EXPORT_FORM_FIELD,
    fieldValuePair: FieldValuePair,
}
// export interface SetRasterExportBoundingBox {
//     type: typeof SET_RASTER_EXPORT_BOUNDING_BOX,
//     boundingBox: MyStore['rasterExportState']['bounds'],
// }

// export interface RequestedRasterExports {
//     type: typeof REQUESTED_RASTER_EXPORTS
// }

export interface RequestRasterExports {
    type: typeof REQUEST_RASTER_EXPORTS,
    // ids: ExportGridCelId[],
    // resolution: number | "",
    // projection: string,
    // tileWidth: number | "",
    // tileHeight: number | "",
    // bounds: Bounds,
}
export interface ReceivedTaskRasterExport {
    type: typeof RECEIVED_TASK_RASTER_EXPORT,
    id: ExportGridCelId,
}

export interface FailedTaskRasterExport {
    type: typeof FAILED_TASK_RASTER_EXPORT,
    id: ExportGridCelId,
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
    // SetRasterExportResolution |
    SetRasterExportFormField |
    RemoveAllExportGridCells |
    RequestRasterExports | 
    ReceivedTaskRasterExport |
    FailedTaskRasterExport; // |
    // RequestedRasterExports; //| 
    // SetRasterExportBoundingBox;

// export interface RasterExport {
//     type: typeof REQUEST_WMS
// };

// export interface ReceiveWMS {
//     type: typeof RECEIVE_WMS,
//     payload: WMSObject
// };

// export type WMSActionType = RequestWMS | ReceiveWMS | ToggleAlert;

export interface RasterExportRequest {
    fetchingState: FetchingState;
    id: ExportGridCelId;
    projection: string;
    bounds: Bounds;
    resolution: number | "";
    tileWidth: number | "";
    tileHeight: number | "";
}