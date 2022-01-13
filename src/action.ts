import request from 'superagent';
import { Dispatch } from 'redux';
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
    ScenariosObject,
} from './interface';
import { 
    getExportGridCellResolution, 
    getExportGridCellProjection, 
    getExportGridCellTileWidth, 
    getExportGridCellTileHeight, 
    getExportGridCellBounds, 
    getExportSelectedGridCellIds,
    getDateTimeStart,
    getExportNoDataValue,
} from './reducers';
import { areGridCelIdsEqual } from './utils/rasterExportUtils'
import { recursiveFetchFunction } from './hooks';



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

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, layercollectionSlug: string, ordering: string, dispatch): void => {
    dispatch(rastersRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (layercollectionSlug) params.push(`layer_collections__slug=${encodeURIComponent(layercollectionSlug)}`);
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

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, layercollectionSlug: string, ordering: string, dispatch): void => {
    dispatch(wmsRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (layercollectionSlug) params.push(`layer_collections__slug=${encodeURIComponent(layercollectionSlug)}`);
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

//MARK: Scenarios
export const REQUEST_SCENARIOS = 'REQUEST_SCENARIOS';
export const RECEIVE_SCENARIOS = 'RECEIVE_SCENARIOS';

const scenariosRequested = () => ({
    type: REQUEST_SCENARIOS
});

const scenariosReceived = (scenariosObject: ScenariosObject) => ({
    type: RECEIVE_SCENARIOS,
    payload: scenariosObject
});

export const fetchScenarios = (page: number, searchTerm: string, organisationName: string, ordering: string, dispatch): void => {
    dispatch(scenariosRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
    if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

    const queries = params.join('&');

    request
        .get(`/api/v4/scenarios/?${queries}`)
        .then(response => {
            if (
                response.body.count === 0 &&
                // Check if search input is an UUID
                searchTerm && searchTerm.includes('-') && searchTerm.length === 36
            ) {
                //If could not find any scenario with the search term by scenario's name then look for its uuid
                const newQueries = queries.replace('name__icontains', 'uuid');
                request
                    .get(`/api/v4/scenarios/?${newQueries}`)
                    .then(response => {
                        dispatch(scenariosReceived(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(scenariosReceived(response.body))
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
            if (
                response.body.count === 0 &&
                // Check if search input is an UUID
                searchTerm && searchTerm.includes('-') && searchTerm.length === 36
            ) {
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

export const fetchTimeseries = (uuid: string, signal?: AbortSignal) => async (dispatch) => {
    dispatch(timeseriesRequested());

    const timeseries = await recursiveFetchFunction(`/api/v4/monitoringnetworks/${uuid}/timeseries/`, { page_size: 100 }, [], signal);

    if (!timeseries) {
        dispatch(addNotification(`Failed to load available timeseries for monitoring network ${uuid}.`, 2000));
        return {
            status: 'Error',
            errorMessage: `Failed to load available timeseries for monitoring network ${uuid}.`
        };
    };

    dispatch(timeseriesReceived(timeseries));
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

const observationTypesReceived = (observationTypeList: ObservationType[], count: number) => ({
    type: RECEIVE_NETWORK_OBSERVATION_TYPES,
    observationTypeList,
    count
});

export const fetchMonitoringNetworkObservationTypes = (uuid: string, signal?: AbortSignal) => async (dispatch) => {
    dispatch(observationTypesRequested());

    const observationTypes = await recursiveFetchFunction(`/api/v4/monitoringnetworks/${uuid}/observationtypes/`, { page_size: 10000 }, [], signal);

    if (!observationTypes) {
        dispatch(addNotification(`Failed to load available observation types for monitoring network ${uuid}.`, 2000));
        return {
            status: 'Error',
            errorMessage: `Failed to load available observation types for monitoring network ${uuid}.`
        };
    };

    dispatch(observationTypesReceived(observationTypes, observationTypes.length));
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

export const fetchLocations = (uuid: string, signal?: AbortSignal) => async (dispatch) => {
    dispatch(locationsRequested());

    const locations = await recursiveFetchFunction(`/api/v4/monitoringnetworks/${uuid}/locations/`, { page_size: 1000 }, [], signal);

    if (!locations) {
        dispatch(addNotification(`Failed to load available locations for monitoring network ${uuid}.`, 2000));
        return{
            status: 'Error',
            errorMessage: `Failed to load available locations for monitoring network ${uuid}.`
        };
    };

    dispatch(locationsReceived(locations));
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
export const USER_ORGANISATIONS_FETCHED = 'USER_ORGANISATIONS_FETCHED';
export const LAYERCOLLECTIONS_FETCHED = 'LAYERCOLLECTIONS_FETCHED';

export const fetchObservationTypes = async (dispatch) => {
    const observationTypes = await recursiveFetchFunction(`/api/v4/observationtypes/`, { page_size: 10000 });

    if (!observationTypes) {
        dispatch(addNotification('Failed to load available observation types.'));
        return {
            status: 'Error',
            errorMessage: `Failed to load available observation types.`
        };
    };

    dispatch({
        type: OBSERVATION_TYPES_FETCHED,
        observationTypes
    });
};

export const fetchOrganisations = async (dispatch) => {
    const organisations = await recursiveFetchFunction(`/api/v4/organisations/`, { page_size: 1000 });

    if (!organisations) {
        dispatch(addNotification('Failed to load available organisations.'));
        return {
            status: 'Error',
            errorMessage: `Failed to load available organisations.`
        };
    };

    dispatch({
        type: ORGANISATIONS_FETCHED,
        organisations
    });
};

export const fetchUserOrganisations = (userId: number) => async dispatch => {
    const userOrganisations = await recursiveFetchFunction(`/api/v4/users/${userId}/organisations/`, {});

    if (!userOrganisations) {
        dispatch(addNotification('Failed to load available organisations of current user.'));
        return {
            status: 'Error',
            errorMessage: `Failed to load available organisations of current user.`
        };
    };

    dispatch({
        type: USER_ORGANISATIONS_FETCHED,
        organisations: userOrganisations
    });
};

export const fetchLayercollections = async (dispatch) => {
    const layercollections = await recursiveFetchFunction(`/api/v4/layercollections/`, {});

    if (!layercollections) {
        dispatch(addNotification('Failed to load available layercollections.'));
        return {
            status: 'Error',
            errorMessage: `Failed to load available layercollections.`
        };
    };

    dispatch({
        type: LAYERCOLLECTIONS_FETCHED,
        layercollections
    });
};

//MARK: Filters
export const SELECT_ORGANISATION = 'SELECT_ORGANISATION';
export const SELECT_LAYERCOLLECTION = 'SELECT_LAYERCOLLECTION';
export const SELECT_OBSERVATIONTYPE = 'SELECT_OBSERVATIONTYPE';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const REMOVE_ORGANISATION = 'REMOVE_ORGANISATION';
export const REMOVE_LAYERCOLLECTION = 'REMOVE_LAYERCOLLECTION';
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

export const selectLayercollection = (dispatch, layercollection: string) => {
    dispatch({
        type: SELECT_LAYERCOLLECTION,
        layercollection
    });
};

export const removeLayercollection = (dispatch) => {
    dispatch({
        type: REMOVE_LAYERCOLLECTION
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
    setInterval(async () => {
        const messages = await recursiveFetchFunction(`/api/v3/inbox/`, {});
        if (!messages) return;
        dispatch({
            type: REQUEST_INBOX,
            messages
        });
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

// MARK: Raster export
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
export const SET_NO_DATA_VALUE = "SET_NO_DATA_VALUE";

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

export const setNoDataValue = (value: number) => ({
    type: SET_NO_DATA_VALUE,
    noDataValue: value
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

export const updateExportFormAndFetchExportGridCells = (fieldValuePairesToUpdate: FieldValuePair[]) => (
    dispatch: Dispatch<RemoveAllSelectedExportGridCellIds | RemoveAllExportGridCells | SetRasterExportFormFields | RequestedGridCells | RetrievedRasterExportGridcells | FailedRetrievingRasterExportGridcells>
) => {
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

export const requestRasterExports = (numberOfInboxMessages: number, openDownloadModal: Function) => (dispatch) =>{

    dispatch(setCurrentRasterExportsToStore(numberOfInboxMessages));

    const state = store.getState();
    const selectedGridCellIds = getExportSelectedGridCellIds(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const start = getDateTimeStart(state);
    const noDataValue = getExportNoDataValue(state);
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

        const params = [
            'format=geotiff',
            `bbox=${currentGridBbox}`,
            `projection=${projection}`,
            `width=${tileWidth}`,
            `height=${tileHeight}`,
            'async=true',
            'notify_user=true'
        ];

        if (start !== '') params.push(`start=${start}`);
        if (noDataValue !== undefined) params.push(`nodata=${noDataValue}`);

        const urlQuery = params.join('&');

        const requestUrl = `/api/v4/rasters/${rasterUuid}/data/?${urlQuery}`;

        fetch(requestUrl)
        .then(res => res.json())
        .then((res) => {
            if (res.status === 400) {
                if (res.detail.nodata && res.detail.nodata[0]) {
                    console.error(res.detail.nodata[0]);
                    dispatch(addNotification(res.detail.nodata[0]));
                } else {
                    console.error(res);
                    dispatch(addNotification('Raster export failed.'));
                };
                return;
            };
            openDownloadModal();
            dispatch(receivedTaskRasterExport(id));
        })
        .catch(error => {
            console.error(error);
            dispatch(failedTaskRasterExport(id));
        });
    });
};

export const requestProjections = (rasterUuid: string) => async (dispatch) => {
    dispatch(setFetchingStateProjections("SENT"));

    const projections = await recursiveFetchFunction(`/api/v4/rasters/${rasterUuid}/projections/?page_size=100`, {});

    if (!projections) {
        dispatch(addNotification('Failed to load available projections.'));
        dispatch(setFetchingStateProjections("FAILED"));
        return;
    };

    dispatch(receivedProjections(projections));
};

// MARK: Timeseries export
export const REQUEST_TIMESERIES_EXPORT = 'REQUEST_TIMESERIES_EXPORT';
export const ADD_TIMESERIES_EXPORT_TASK = 'ADD_TIMESERIES_EXPORT_TASK';

export const requestTimeseriesExport = (numberOfInboxMessages: number) => ({
    type: REQUEST_TIMESERIES_EXPORT,
    numberOfInboxMessages
});

export const addTimeseriesExportTask = (numberOfInboxMessages: number, taskUuid: string) => (dispatch) => {
    dispatch(requestTimeseriesExport(numberOfInboxMessages));
    dispatch({
        type: ADD_TIMESERIES_EXPORT_TASK,
        taskUuid
    });
};

// MARK: Notification center
export const DISMISS_NOTIFICATION = "DISMISS_NOTIFICATION";
export const SHOW_NOTIFICATION = "SHOW_NOTIFICATION";

const  showNotification = (message: string) => ({
    type: SHOW_NOTIFICATION,
    message
});

export const dismissNotification = () => ({
    type: DISMISS_NOTIFICATION
});

export const addNotification = (message: string, timeout?: number) => (dispatch) => {
    if (timeout) {
        setTimeout(() => {
            dispatch(dismissNotification());
        }, timeout);
    };
    dispatch(showNotification(message));
};