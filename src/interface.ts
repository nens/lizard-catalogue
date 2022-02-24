import { Polygon } from "geojson";
import { MyStore } from './reducers';

// TABLE TABS
export type TableTab = 'Details' | 'Actions' | 'Results';

// LIZARD BOOTSTRAP
export interface Bootstrap {
    user: {
        id: number | null,
        first_name: string | null,
        username: string | null,
        authenticated: boolean
    },
    isFetching: boolean
};

// RASTER
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
    layer_collections: Layercollection[],
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
    spatial_bounds: Bounds,
    supplier: string,
    options: {
        styles: string
    }
};

// WMS
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
    wms_url: string | null,
    organisation: Organisation,
    layer_collections: Layercollection[],
    access_modifier: string,
    download_url: string | null,
    spatial_bounds: Bounds | null,
    supplier: string,
};

// SCENARIO
export interface ScenariosObject {
    count: number,
    previous: string,
    next: string,
    results: Scenario[]
};

export interface Scenario {
    uuid: string,
    name: string,
    url: string,
    organisation: Organisation,
    access_modifier: string,
    created: string,
    last_modified: string,
    simulation_id: number,
    start_time_sim: string,
    end_time_sim: string,
    username: string,
    for_icms: boolean,
    model_url: string | null,
    model_revision: string,
    model_name: string,
    has_raw_results: boolean,
    total_size: number,
    supplier: string,
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

// ORGANISATION
export interface Organisation {
    url: string,
    name: string,
    uuid: string,
    roles: string[]
};

// OBSERVATION TYPE
export interface ObservationType {
    id: number,
    url: string,
    code: string,
    parameter: string,
    unit: string,
    scale: string,
    description: string,
    reference_frame?: string | null,
};

// LAYERCOLLECTION
export interface Layercollection {
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

// EXPORT MESSAGE
export interface Message {
    id: string,
    message: string,
    url: string,
    downloaded: boolean,
};

export type ExportGridCellId = number[];

export interface ExportGridCell {
    type: string,
    geometry: Polygon,
    properties: {
        projection: string,
        bbox: number[],
        id: ExportGridCellId
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
    selectedGridCellIds: ExportGridCellId[],
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
    noDataValue?: number,
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

export type RasterExportFormFieldType = (
    MyStore['rasterExportState']['resolution'] | 
    MyStore['rasterExportState']['projection'] |
    MyStore['rasterExportState']['tileWidth'] |
    MyStore['rasterExportState']['tileHeight'] |
    MyStore['rasterExportState']['bounds'] |
    MyStore['rasterExportState']['noDataValue']
)

export interface FieldValuePair{field: keyof MyStore['rasterExportState'] & string, value: RasterExportFormFieldType}

export interface RasterExportRequest {
    fetchingState: FetchingState;
    id: ExportGridCellId;
    projection: string;
    bounds: Bounds;
    resolution: number | "";
    tileWidth: number | "";
    tileHeight: number | "";
    noDataValue?: number;
}