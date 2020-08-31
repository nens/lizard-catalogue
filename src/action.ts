import request from 'superagent';
import { Dispatch,} from 'redux';
import store  from './store';
import {
    RasterListObject,
    WMSObject,
    SwitchDataType,
    ExportGridCelId,
    RemoveFromSelectedExportGridCellIds,
    AddToSelectedExportGridCellIds,
    RemoveAllSelectedExportGridCellIds,
    RequestedGridCells,
    ExportGridCell,
    RetrievedRasterExportGridcells,
    FailedRetrievingRasterExportGridcells,
    FieldValuePair,
    RemoveAllExportGridCells,
    RequestRasterExports,
    ReceivedTaskRasterExport,
    FailedTaskRasterExport,
    ReceivedProjections,
    Projection,
    FetchingState,
    SetFetchingStateProjections,
    SetRasterExportFormFields,
    MonitoringNetworkObject,
    TimeSeries,
    Location,
    ObservationType,
} from './interface';
import { 
    getExportGridCellResolution, 
    getExportGridCellProjection, 
    getExportGridCellTileWidth, 
    getExportGridCellTileHeight, 
    getExportGridCellBounds, 
    getExportSelectedGridCellIds,
    getDateTimeStart,
} from './reducers';
import {areGridCelIdsEqual} from './utils/rasterExportUtils'



//MARK: Bootsrap
export const REQUEST_LIZARD_BOOTSTRAP = "REQUEST_LIZARD_BOOTSTRAP";
export const RECEIVE_LIZARD_BOOTSTRAP = "RECEIVE_LIZARD_BOOTSTRAP";

export const fetchLizardBootstrap = (dispatch) => {
    dispatch({
        type: REQUEST_LIZARD_BOOTSTRAP
    });
    fetch("/bootstrap/lizard/", {
        credentials: "same-origin"
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.user && data.user.authenticated === true) {
            dispatch({
                type: RECEIVE_LIZARD_BOOTSTRAP,
                payload: data
            });
        } 
    });
};

//MARK: Switch between rasters and wms layers
export const SWITCH_DATA_TYPE = 'SWITCH_DATA_TYPE';

export const switchDataType = (dataType: SwitchDataType['payload'], dispatch): void => {
    dispatch({
        type: SWITCH_DATA_TYPE,
        payload: dataType
    });
};

//MARK: Raster
export const RASTERS_REQUESTED = 'RASTERS_REQUESTED';
export const RASTERS_FETCHED = 'RASTERS_FETCHED';

const rastersRequested = () => ({
    type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject) => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
});

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(rastersRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (datasetSlug) params.push(`datasets__slug=${encodeURIComponent(datasetSlug)}`);
    if (observationTypeParameter) params.push(`observation_type__parameter__icontains=${encodeURIComponent(observationTypeParameter)}`);
    if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

    const queries = params.join('&');

    request
        .get(`/api/v4/rasters/?${queries}&scenario__isnull=true`)
        .then(response => {
            if(response.body.count === 0 && searchTerm) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                const newQueries = queries.replace('name__icontains', 'uuid');
                request
                    .get(`/api/v4/rasters/?${newQueries}&scenario__isnull=true`)
                    .then(response => {
                        dispatch(rastersFetched(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(rastersFetched(response.body))
            }
        })
        .catch(console.error)
};

//MARK: WMS
export const REQUEST_WMS = 'REQUEST_WMS';
export const RECEIVE_WMS_LAYERS = 'RECEIVE_WMS_LAYERS';

const wmsRequested = () => ({
    type: REQUEST_WMS
});

const wmsLayersReceived = (wmsObject: WMSObject) => ({
    type: RECEIVE_WMS_LAYERS,
    payload: wmsObject
});

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(wmsRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (datasetSlug) params.push(`datasets__slug=${encodeURIComponent(datasetSlug)}`);
    if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

    const queries = params.join('&');

    request
        .get(`/api/v4/wmslayers/?${queries}`)
        .then(response => {
            if(response.body.count === 0 && searchTerm) {
                //If could not find any WMS layer with the search term by WMS's name then look for WMS's uuid
                const newQueries = queries.replace('name__icontains', 'uuid');
                request
                    .get(`/api/v4/wmslayers/?${newQueries}`)
                    .then(response => {
                        dispatch(wmsLayersReceived(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(wmsLayersReceived(response.body))
            }
        })
        .catch(console.error)
};

//MARK: Monitoring Networks for Timeseries
export const REQUEST_MONITORING_NETWORKS = 'REQUEST_MONITORING_NETWORKS';
export const RECEIVE_MONITORING_NETWORKS = 'RECEIVE_MONITORING_NETWORKS';

const monitoringNetworksRequested = () => ({
    type: REQUEST_MONITORING_NETWORKS
});

const monitoringNetworksReceived = (monitoringNetwork: MonitoringNetworkObject) => ({
    type: RECEIVE_MONITORING_NETWORKS,
    payload: monitoringNetwork
});

export const fetchMonitoringNetworks = (page: number, searchTerm: string, organisationName: string, ordering: string, dispatch): void => {
    dispatch(monitoringNetworksRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

    const queries = params.join('&');

    request
        .get(`/api/v4/monitoringnetworks/?${queries}`)
        .then(response => {
            if(response.body.count === 0 && searchTerm) {
                //If could not find any monitoring network with the search term by monitoring network's name then look for its uuid
                const newQueries = queries.replace('name__icontains', 'uuid');
                request
                    .get(`/api/v4/monitoringnetworks/?${newQueries}`)
                    .then(response => {
                        dispatch(monitoringNetworksReceived(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(monitoringNetworksReceived(response.body))
            }
        })
        .catch(console.error)
};

//MARK: TimeSeries for selected monitoring network
export const REQUEST_TIMESERIES = 'REQUEST_TIMESERIES';
export const RECEIVE_TIMESERIES = 'RECEIVE_TIMESERIES';
export const REMOVE_TIMESERIES = 'REMOVE_TIMESERIES';

const timeseriesRequested = () => ({
    type: REQUEST_TIMESERIES
});

const timeseriesReceived = (timeseriesList: TimeSeries[]) => ({
    type: RECEIVE_TIMESERIES,
    timeseriesList
});

export const fetchTimeseries = (uuid: string) => (dispatch) => {
    dispatch(timeseriesRequested());

    request
        .get(`/api/v4/monitoringnetworks/${uuid}/timeseries/?page_size=10000`)
        .then(response => {
            dispatch(timeseriesReceived(response.body.results))
        })
        .catch(console.error)
};

export const removeTimeseries = () => (dispatch) => {
    dispatch({
        type: REMOVE_TIMESERIES
    });
};

//MARK: Observation types for selected monitoring network
export const REQUEST_NETWORK_OBSERVATION_TYPES = 'REQUEST_NETWORK_OBSERVATION_TYPES';
export const RECEIVE_NETWORK_OBSERVATION_TYPES = 'RECEIVE_NETWORK_OBSERVATION_TYPES';

const observationTypesRequested = () => ({
    type: REQUEST_NETWORK_OBSERVATION_TYPES
});

const observationTypesReceived = (observationTypeList: ObservationType[]) => ({
    type: RECEIVE_NETWORK_OBSERVATION_TYPES,
    observationTypeList
});

export const fetchMonitoringNetworkObservationTypes = (uuid: string) => (dispatch) => {
    dispatch(observationTypesRequested());

    request
        .get(`/api/v4/monitoringnetworks/${uuid}/observationtypes/?page_size=1000`)
        .then(response => {
            dispatch(observationTypesReceived(response.body.results))
        })
        .catch(console.error)
};

//MARK: Locations for selected monitoring network
export const REQUEST_LOCATIONS = 'REQUEST_LOCATIONS';
export const RECEIVE_LOCATIONS = 'RECEIVE_LOCATIONS';

const locationsRequested = () => ({
    type: REQUEST_LOCATIONS
});

const locationsReceived = (locationsList: Location[]) => ({
    type: RECEIVE_LOCATIONS,
    locationsList
});

export const fetchLocations = (uuid: string) => (dispatch) => {
    dispatch(locationsRequested());
    request
        .get(`/api/v4/monitoringnetworks/${uuid}/locations/?page_size=10000`)
        .then(response => {
            dispatch(locationsReceived(response.body.results))
        })
        .catch(console.error)
};

//MARK: Select Item to view (Raster or WMS layer)
export const ITEM_SELECTED = 'ITEM_SELECTED';

export const selectItem = (uuid: string, dispatch): void => {
    dispatch({
        type: ITEM_SELECTED,
        uuid
    });
};

//MARK: Observation types and Organisation
export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';
export const DATASETS_FETCHED = 'DATASETS_FETCHED';

export const fetchObservationTypes = (dispatch): void => {
    request
        .get(`/api/v4/observationtypes/?page_size=0`)
        .then(response => {
            dispatch({
                type: OBSERVATION_TYPES_FETCHED,
                observationTypes: response.body
            });
        })
        .catch(console.error)
};

export const fetchOrganisations = (dispatch): void => {
    request
        .get(`/api/v4/organisations/?page_size=0`)
        .then(response => {
            dispatch({
                type: ORGANISATIONS_FETCHED,
                organisations: response.body
            });
        })
        .catch(console.error)
};

export const fetchDatasets = (dispatch): void => {
    request
        .get(`/api/v4/datasets/?page_size=0`)
        .then(response => {
            dispatch({
                type: DATASETS_FETCHED,
                datasets: response.body
            });
        })
        .catch(console.error)
};

//MARK: Filters
export const SELECT_ORGANISATION = 'SELECT_ORGANISATION';
export const SELECT_DATASET = 'SELECT_DATASET';
export const SELECT_OBSERVATIONTYPE = 'SELECT_OBSERVATIONTYPE';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const REMOVE_ORGANISATION = 'REMOVE_ORGANISATION';
export const REMOVE_DATASET = 'REMOVE_DATASET';
export const REMOVE_OBSERVATIONTYPE = 'REMOVE_OBSERVATIONTYPE';
export const REMOVE_SEARCH = 'REMOVE_SEARCH';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const UPDATE_PAGE = 'UPDATE_PAGE';

export const selectOrganisation = (dispatch, organisation: string) => {
    dispatch({
        type: SELECT_ORGANISATION,
        organisation
    });
};

export const removeOrganisation = (dispatch) => {
    dispatch({
        type: REMOVE_ORGANISATION
    });
};

export const selectDataset = (dispatch, dataset: string) => {
    dispatch({
        type: SELECT_DATASET,
        dataset
    });
};

export const removeDataset = (dispatch) => {
    dispatch({
        type: REMOVE_DATASET
    });
};

export const selectObservationType = (dispatch, observationType: string) => {
    dispatch({
        type: SELECT_OBSERVATIONTYPE,
        observationType
    });
};

export const removeObservationType = (dispatch) => {
    dispatch({
        type: REMOVE_OBSERVATIONTYPE
    });
};

export const updateSearch = (dispatch, searchTerm: string) => {
    dispatch({
        type: UPDATE_SEARCH,
        searchTerm
    });
};

export const removeSearch = (dispatch) => {
    dispatch({
        type: REMOVE_SEARCH
    });
};

export const updateOrder = (dispatch, ordering: string) => {
    dispatch({
        type: UPDATE_ORDER,
        ordering
    });
};

export const updatePage = (dispatch, page: number) => {
    dispatch({
        type: UPDATE_PAGE,
        page
    });
};


//MARK: Basket
export const UPDATE_BASKET_WITH_RASTER = 'UPDATE_BASKET_WITH_RASTER';
export const REMOVE_RASTER_FROM_BASKET = 'REMOVE_RASTER_FROM_BASKET';
export const UPDATE_BASKET_WITH_WMS = 'UPDATE_BASKET_WITH_WMS';
export const REMOVE_WMS_FROM_BASKET = 'REMOVE_WMS_FROM_BASKET';

export const updateBasketWithRaster = (rasters: string[], dispatch): void => {
    dispatch({
        type: UPDATE_BASKET_WITH_RASTER,
        rasters
    });
};

export const removeRasterFromBasket = (uuid: string, dispatch): void => {
    dispatch({
        type: REMOVE_RASTER_FROM_BASKET,
        uuid
    });
};

export const updateBasketWithWMS = (wmsLayers: string[], dispatch): void => {
    dispatch({
        type: UPDATE_BASKET_WITH_WMS,
        wmsLayers
    });
};

export const removeWMSFromBasket = (uuid: string, dispatch): void => {
    dispatch({
        type: REMOVE_WMS_FROM_BASKET,
        uuid
    });
};

//MARK: Toggle the showAlert
export const TOGGLE_ALERT = 'TOGGLE_ALERT';

export const toggleAlert = (dispatch) => {
    dispatch({
        type: TOGGLE_ALERT
    });
};

//MARK: Request inbox messages
export const REQUEST_INBOX = 'REQUEST_INBOX';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
export const DOWNLOAD_FILE = 'DOWNLOAD_FILE';

export const requestInbox = (dispatch) => {
    setInterval(() => {
        request
            .get(`/api/v3/inbox/?page_size=10000000`)
            .then(response => {
                dispatch({
                    type: REQUEST_INBOX,
                    messages: response.body.results
                });
            })
            .catch(console.error)
    }, 5000);
};

export const removeMessage = (dispatch, id: string) => {
    dispatch({
        type: REMOVE_MESSAGE,
        id
    });
};

export const downloadFile = (dispatch, id: string) => {
    dispatch({
        type: DOWNLOAD_FILE,
        id
    });
};


export const ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS = 'ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS';
export const REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS = 'REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS';
export const REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS = 'REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS';
export const REQUESTED_RASTER_EXPORT_GRIDCELLS = 'REQUESTED_RASTER_EXPORT_GRIDCELLS';
export const RETRIEVED_RASTER_EXPORT_GRIDCELLS = 'RETRIEVED_RASTER_EXPORT_GRIDCELLS';
export const FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS = 'FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS';
export const SET_RASTER_EXPORT_RESOLUTION = 'SET_RASTER_EXPORT_RESOLUTION';
export const REMOVE_ALL_EXPORT_GRID_CELLS = 'REMOVE_ALL_EXPORT_GRID_CELLS';
export const REQUEST_RASTER_EXPORTS = "REQUEST_RASTER_EXPORTS";
export const RECEIVED_TASK_RASTER_EXPORT = "RECEIVED_TASKS_RASTER_EXPORTS";
export const FAILED_TASK_RASTER_EXPORT = "FAILED_TASK_RASTER_EXPORT";
export const RECEIVED_PROJECTIONS = "RECEIVED_PROJECTIONS";
export const FETCHING_STATE_PROJECTIONS = "FETCHING_STATE_PROJECTIONS";
export const SET_RASTER_EXPORT_FORM_FIELDS = "SET_RASTER_EXPORT_FORM_FIELDS";
export const REMOVE_CURRENT_EXPORT_TASKS = "REMOVE_CURRENT_EXPORT_TASKS";

export const removeCurrentExportTasks = (dispatch) => {
    dispatch({
        type: REMOVE_CURRENT_EXPORT_TASKS
    });
};

export const removeFromSelectedExportGridCellIds = (gridCellIds: ExportGridCelId[]): RemoveFromSelectedExportGridCellIds => ({
    type: REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const addToSelectedExportGridCellIds = (gridCellIds: ExportGridCelId[]): AddToSelectedExportGridCellIds => ({
    type: ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const removeAllSelectedExportGridCellIds = (): RemoveAllSelectedExportGridCellIds => ({
    type: REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
});
export const removeAllExportGridCells = (): RemoveAllExportGridCells => ({
    type: REMOVE_ALL_EXPORT_GRID_CELLS,
});


export const requestedGridCells = (): RequestedGridCells => ({
    type: REQUESTED_RASTER_EXPORT_GRIDCELLS
});
export const retrievedGridCells = (gridCells: ExportGridCell[]): RetrievedRasterExportGridcells => ({
    type: RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    gridCells: gridCells,
});
export const failedRetrievingRasterExportGridcells = (msg: string): FailedRetrievingRasterExportGridcells=> ({
    type: FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    failedMsg: msg,
});
export const updateExportRasterFormFields = (fieldValuePairs:FieldValuePair[]): SetRasterExportFormFields => ({
    type: SET_RASTER_EXPORT_FORM_FIELDS,
    fieldValuePairs,
});

export const setCurrentRasterExportsToStore = (numberOfInboxMessages:number): RequestRasterExports => ({
    type: REQUEST_RASTER_EXPORTS,
    numberOfInboxMessages,
})

export const receivedTaskRasterExport = (id: ExportGridCelId): ReceivedTaskRasterExport => ({
    type: RECEIVED_TASK_RASTER_EXPORT,
    id: id,
})

export const failedTaskRasterExport = (id: ExportGridCelId): FailedTaskRasterExport => ({
    type: FAILED_TASK_RASTER_EXPORT,
    id: id,
})
export const receivedProjections = (projections: Projection[]) : ReceivedProjections => ({
    type: RECEIVED_PROJECTIONS,
    projections,
})
export const setFetchingStateProjections = (fetchingState: FetchingState) : SetFetchingStateProjections => ({
    type: FETCHING_STATE_PROJECTIONS,
    fetchingState,
}) 


const fieldValuePairContainsFieldThatShouldResetGridCells = (fieldValuePair: FieldValuePair) => {
     return   fieldValuePair.field === 'projection' ||
        fieldValuePair.field === 'resolution' ||
        fieldValuePair.field === 'tileWidth' ||
        fieldValuePair.field === 'tileHeight'
}
const fieldValuePairsListContainsFieldThatShouldResetGridCells = (fieldValuePairs: FieldValuePair[]) => {
    return   !!fieldValuePairs.find(fieldValuePairContainsFieldThatShouldResetGridCells);
}

export const updateExportFormAndFetchExportGridCells = (fieldValuePairesToUpdate: FieldValuePair[]) => 
    (
    dispatch: Dispatch<RemoveAllSelectedExportGridCellIds | RemoveAllExportGridCells | SetRasterExportFormFields | RequestedGridCells | RetrievedRasterExportGridcells | FailedRetrievingRasterExportGridcells>
    ) =>
    {

    if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
        dispatch(removeAllExportGridCells());
    }
    dispatch(updateExportRasterFormFields(fieldValuePairesToUpdate));

    const state = store.getState();
    const resolution = getExportGridCellResolution(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const rasterUuid = state.selectedItem;
    const bounds = getExportGridCellBounds(state);
    const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
    
    request
        .get(`/api/v4/rasters/${rasterUuid}/grid/?projection=${projection}&cell_size=${resolution}&tile_height=${tileHeight}&tile_width=${tileWidth}&bbox=${boundsString}`)
        .then(response => {
            const gridCells = response.body.features;

            const newState = store.getState();
            const newResolution = getExportGridCellResolution(newState);
            const newProjection = getExportGridCellProjection(newState);
            const newTileWidth = getExportGridCellTileWidth(newState);
            const newTileHeight = getExportGridCellTileHeight(newState);
            const newRasterUuid = newState.selectedItem;

            if (
                // only update the gridcells if the values for which the request was done were not changed
                newResolution === resolution &&
                newProjection === projection &&
                newTileWidth === tileWidth &&
                newTileHeight === tileHeight &&
                newRasterUuid === rasterUuid
            ) {
                if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
                    dispatch(removeAllExportGridCells());
                }
                dispatch(retrievedGridCells(gridCells));
            }
        })
        .catch(error=>{
            console.error(error);
            dispatch(failedRetrievingRasterExportGridcells(error+''));
        })
};

export const requestRasterExports = (numberOfInboxMessages:number) => (dispatch: Dispatch<RequestRasterExports | ReceivedTaskRasterExport | FailedTaskRasterExport>) =>{

    dispatch(setCurrentRasterExportsToStore(numberOfInboxMessages));

    const state = store.getState();
    const selectedGridCellIds = getExportSelectedGridCellIds(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const start = getDateTimeStart(state);
    const rasterUuid = state.selectedItem;
    const availableGridCells = state.rasterExportState.availableGridCells;

    selectedGridCellIds.forEach((id)=>{

        const currentGrid = availableGridCells.find(cell=>{return areGridCelIdsEqual(cell.properties.id, id)});
        if (!currentGrid) {
            console.warn(`Raster with id ${id} not found among availableGridCells. Therefore export was not started.`);
            // TODO how do we recover from this ?
            return;
        }
        const currentGridBbox = currentGrid.properties.bbox;
        const requestUrl = start===''?
            `/api/v4/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&async=true&notify_user=true`
            :
            `/api/v4/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&start=${start}&async=true&notify_user=true`

        request.get(requestUrl)
        .then(() => {
            dispatch(receivedTaskRasterExport(id));
        })
        .catch(error=>{
            console.error(error);
            dispatch(failedTaskRasterExport(id));
        })

    });
    
};

export const requestProjections = (rasterUuid: string) => (dispatch: Dispatch<SetFetchingStateProjections | ReceivedProjections | SetFetchingStateProjections>) => {
    dispatch(setFetchingStateProjections("SENT"));

    const requestUrl = `/api/v4/rasters/${rasterUuid}/projections/?page_size=100000`;
    request.get(requestUrl)
    .then(response => {
        dispatch(receivedProjections(response.body.results));
    })
    .catch(error=>{
        console.error(error);
        dispatch(setFetchingStateProjections("FAILED"));
    })

};
