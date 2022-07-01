import request from 'superagent';
import { Thunk } from './store';
import {
    RasterListObject,
    WMSObject,
    ExportGridCellId,
    ExportGridCell,
    FieldValuePair,
    Projection,
    FetchingState,
    MonitoringNetworkObject,
    TimeSeries,
    Location,
    ObservationType,
    ScenariosObject
} from './interface';
import { getRasterExportState } from './reducers';
import { areGridCelIdsEqual } from './utils/rasterExportUtils'
import { recursiveFetchFunction } from './hooks';
import { UUID_REGEX } from './utils/uuidRegex';

//MARK: Bootsrap
export const REQUEST_LIZARD_BOOTSTRAP = "REQUEST_LIZARD_BOOTSTRAP";
export const RECEIVE_LIZARD_BOOTSTRAP = "RECEIVE_LIZARD_BOOTSTRAP";

export const fetchLizardBootstrap = (): Thunk => dispatch => {
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

export interface SwitchDataType {
    type: typeof SWITCH_DATA_TYPE,
    payload: "Raster" | "WMS" | "Timeseries" | "Scenario"
};

export const switchDataType = (dataType: SwitchDataType['payload']): Thunk => dispatch => {
    dispatch({
        type: SWITCH_DATA_TYPE,
        payload: dataType
    });
};

//MARK: Raster
export const RASTERS_REQUESTED = 'RASTERS_REQUESTED';
export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_FETCHED = 'RASTER_FETCHED';

const rastersRequested = () => ({
    type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject) => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
});

export const fetchRaster = (uuid: string): Thunk => (dispatch) => {
    request
        .get(`/api/v4/rasters/${uuid}/`)
        .then(response => dispatch({
            type: RASTER_FETCHED,
            raster: response.body
        }))
        .catch(console.error)
};

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, layercollectionSlug: string, ordering: string): Thunk => dispatch => {
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
            if (response.body.count === 0 && searchTerm) {
                // If no raster found by name then search by uuid
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
export const RECEIVE_WMS_LAYER = 'RECEIVE_WMS_LAYER';

const wmsRequested = () => ({
    type: REQUEST_WMS
});

const wmsLayersReceived = (wmsObject: WMSObject) => ({
    type: RECEIVE_WMS_LAYERS,
    payload: wmsObject
});

export const fetchWmsLayer = (uuid: string): Thunk => dispatch => {
    request
        .get(`/api/v4/wmslayers/${uuid}/`)
        .then(response => dispatch({
            type: RECEIVE_WMS_LAYER,
            wms: response.body
        }))
        .catch(console.error)
};

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, layercollectionSlug: string, ordering: string): Thunk => dispatch => {
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
            if (response.body.count === 0 && searchTerm) {
                // If no WMS layer found by name then search by uuid
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
export const RECEIVE_SCENARIO = 'RECEIVE_SCENARIO';

const scenariosRequested = () => ({
    type: REQUEST_SCENARIOS
});

const scenariosReceived = (scenariosObject: ScenariosObject) => ({
    type: RECEIVE_SCENARIOS,
    payload: scenariosObject
});

export const fetchScenario = (uuid: string): Thunk => dispatch => {
    request
        .get(`/api/v4/scenarios/${uuid}/`)
        .then(response => dispatch({
            type: RECEIVE_SCENARIO,
            scenario: response.body
        }))
        .catch(console.error)
};

export const fetchScenarios = (page: number, searchTerm: string, organisationName: string, projectName: string, ordering: string): Thunk => dispatch => {
    dispatch(scenariosRequested());

    const params: string[] = [];

    if (page) params.push(`page=${page}`);
    if (searchTerm) params.push(`${UUID_REGEX.test(searchTerm) ? "uuid" : "name__icontains"}=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation__name=${encodeURIComponent(organisationName)}`);
    if (projectName) params.push(`project__name=${encodeURIComponent(projectName)}`);
    if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

    const queries = params.join('&');

    request
        .get(`/api/v4/scenarios/?${queries}`)
        .then(response => {
            if (response.body.count === 0 && searchTerm && !UUID_REGEX.test(searchTerm)) {
                // If no scenario found by name then search by model name
                const newQueries = queries.replace('name__icontains', 'model_name__icontains');
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
export const RECEIVE_MONITORING_NETWORK = 'RECEIVE_MONITORING_NETWORK';

const monitoringNetworksRequested = () => ({
    type: REQUEST_MONITORING_NETWORKS
});

const monitoringNetworksReceived = (monitoringNetwork: MonitoringNetworkObject) => ({
    type: RECEIVE_MONITORING_NETWORKS,
    payload: monitoringNetwork
});

export const fetchMonitoringNetwork = (uuid: string): Thunk => dispatch => {
    request
        .get(`/api/v4/monitoringnetworks/${uuid}/`)
        .then(response => dispatch({
            type: RECEIVE_MONITORING_NETWORK,
            monitoringNetwork: response.body
        }))
        .catch(console.error)
};

export const fetchMonitoringNetworks = (page: number, searchTerm: string, organisationName: string, ordering: string): Thunk => dispatch => {
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
            if (response.body.count === 0 && searchTerm && UUID_REGEX.test(searchTerm)) {
                // If no monitoring network found by name then search by uuid
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

export const fetchTimeseries = (uuid: string, signal?: AbortSignal, closeModal?: Function): Thunk => async dispatch => {
    dispatch(timeseriesRequested());

    const timeseries = await recursiveFetchFunction(`/api/v4/monitoringnetworks/${uuid}/timeseries/`, { page_size: 100 }, [], signal);

    if (!timeseries) {
        dispatch(addNotification(`Failed to load available timeseries for monitoring network ${uuid}.`, 2000));
        closeModal && closeModal(); // close the Timeseries modal if it failed to load timeseries
    };

    dispatch(timeseriesReceived(timeseries));
};

export const removeTimeseries = (): Thunk => (dispatch) => {
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

export const fetchMonitoringNetworkObservationTypes = (uuid: string, signal?: AbortSignal): Thunk => async dispatch => {
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

export const fetchLocations = (uuid: string, signal?: AbortSignal): Thunk => async dispatch => {
    dispatch(locationsRequested());

    const locations = await recursiveFetchFunction(`/api/v4/monitoringnetworks/${uuid}/locations/`, { page_size: 1000 }, [], signal);

    if (!locations) {
        dispatch(addNotification(`Failed to load available locations for monitoring network ${uuid}.`, 2000));
        return {
            status: 'Error',
            errorMessage: `Failed to load available locations for monitoring network ${uuid}.`
        };
    };

    dispatch(locationsReceived(locations));
};

//MARK: Select Item to view (Raster or WMS layer)
export const ITEM_SELECTED = 'ITEM_SELECTED';

export const selectItem = (uuid: string): Thunk => dispatch => {
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
export const PROJECTS_FETCHED = 'PROJECTS_FETCHED';

export const fetchObservationTypes = (): Thunk => async dispatch => {
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

export const fetchOrganisations = (): Thunk => async dispatch => {
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

export const fetchUserOrganisations = (userId: number): Thunk => async dispatch => {
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

export const fetchLayercollections = (): Thunk => async dispatch => {
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

export const fetchProjects = (): Thunk => async dispatch => {
    const projects = await recursiveFetchFunction(`/api/v4/projects/`, {});

    if (!projects) {
        dispatch(addNotification('Failed to load available projects.'));
        return {
            status: 'Error',
            errorMessage: `Failed to load available projects.`
        };
    };

    dispatch({
        type: PROJECTS_FETCHED,
        projects
    });
};

//MARK: Filters
export const SELECT_ORGANISATION = 'SELECT_ORGANISATION';
export const SELECT_LAYERCOLLECTION = 'SELECT_LAYERCOLLECTION';
export const SELECT_PROJECT = 'SELECT_PROJECT';
export const SELECT_OBSERVATIONTYPE = 'SELECT_OBSERVATIONTYPE';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const REMOVE_ORGANISATION = 'REMOVE_ORGANISATION';
export const REMOVE_LAYERCOLLECTION = 'REMOVE_LAYERCOLLECTION';
export const REMOVE_PROJECT = 'REMOVE_PROJECT';
export const REMOVE_OBSERVATIONTYPE = 'REMOVE_OBSERVATIONTYPE';
export const REMOVE_SEARCH = 'REMOVE_SEARCH';
export const REMOVE_ORDER = 'REMOVE_ORDER';

export const selectOrganisation = (organisation: string): Thunk => dispatch => {
    dispatch({
        type: SELECT_ORGANISATION,
        organisation
    });
};

export const removeOrganisation = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_ORGANISATION
    });
};

export const selectLayercollection = (layercollection: string): Thunk => dispatch => {
    dispatch({
        type: SELECT_LAYERCOLLECTION,
        layercollection
    });
};

export const removeLayercollection = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_LAYERCOLLECTION
    });
};

export const selectProject = (project: string): Thunk => dispatch => {
    dispatch({
        type: SELECT_PROJECT,
        project
    });
};

export const removeProject = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_PROJECT
    });
};

export const selectObservationType = (observationType: string): Thunk => dispatch => {
    dispatch({
        type: SELECT_OBSERVATIONTYPE,
        observationType
    });
};

export const removeObservationType = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_OBSERVATIONTYPE
    });
};

export const updateSearch = (searchTerm: string): Thunk => dispatch => {
    dispatch({
        type: UPDATE_SEARCH,
        searchTerm
    });
};

export const removeSearch = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_SEARCH
    });
};

export const updateOrder = (ordering: string): Thunk => dispatch => {
    dispatch({
        type: UPDATE_ORDER,
        ordering
    });
};

export const removeOrder = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_ORDER
    });
};

export const updatePage = (page: number): Thunk => dispatch => {
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
export const UPDATE_BASKET_WITH_SCENARIOS = 'UPDATE_BASKET_WITH_SCENARIOS';
export const REMOVE_SCENARIO_FROM_BASKET = 'REMOVE_SCENARIO_FROM_BASKET';

export const updateBasketWithRaster = (rasters: string[]): Thunk => dispatch => {
    dispatch({
        type: UPDATE_BASKET_WITH_RASTER,
        rasters
    });
};

export const removeRasterFromBasket = (uuid: string): Thunk => dispatch => {
    dispatch({
        type: REMOVE_RASTER_FROM_BASKET,
        uuid
    });
};

export const updateBasketWithWMS = (wmsLayers: string[]): Thunk => dispatch => {
    dispatch({
        type: UPDATE_BASKET_WITH_WMS,
        wmsLayers
    });
};

export const removeWMSFromBasket = (uuid: string): Thunk => dispatch => {
    dispatch({
        type: REMOVE_WMS_FROM_BASKET,
        uuid
    });
};

export const updateBasketWithScenarios = (scenarios: string[]): Thunk => dispatch => {
    dispatch({
        type: UPDATE_BASKET_WITH_SCENARIOS,
        scenarios
    });
};

export const removeScenarioFromBasket = (uuid: string): Thunk => dispatch => {
    dispatch({
        type: REMOVE_SCENARIO_FROM_BASKET,
        uuid
    });
};

//MARK: Toggle the showAlert
export const TOGGLE_ALERT = 'TOGGLE_ALERT';

export const toggleAlert = (): Thunk => dispatch => {
    dispatch({
        type: TOGGLE_ALERT
    });
};

//MARK: Request inbox messages
export const REQUEST_INBOX = 'REQUEST_INBOX';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
export const DOWNLOAD_FILE = 'DOWNLOAD_FILE';

export const requestInbox = (): Thunk => dispatch => {
    setInterval(async () => {
        const messages = await recursiveFetchFunction(`/api/v3/inbox/`, {});
        if (!messages) return;
        dispatch({
            type: REQUEST_INBOX,
            messages
        });
    }, 5000);
};

export const removeMessage = (id: string): Thunk => dispatch => {
    dispatch({
        type: REMOVE_MESSAGE,
        id
    });
};

export const downloadFile = (id: string): Thunk => dispatch => {
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

export const removeCurrentExportTasks = (): Thunk => dispatch => {
    dispatch({
        type: REMOVE_CURRENT_EXPORT_TASKS
    });
};

export const removeFromSelectedExportGridCellIds = (gridCellIds: ExportGridCellId[]) => ({
    type: REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const addToSelectedExportGridCellIds = (gridCellIds: ExportGridCellId[]) => ({
    type: ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const removeAllSelectedExportGridCellIds = () => ({
    type: REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
});
export const removeAllExportGridCells = () => ({
    type: REMOVE_ALL_EXPORT_GRID_CELLS,
});


export const requestedGridCells = () => ({
    type: REQUESTED_RASTER_EXPORT_GRIDCELLS
});
export const retrievedGridCells = (gridCells: ExportGridCell[]) => ({
    type: RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    gridCells: gridCells,
});
export const failedRetrievingRasterExportGridcells = (msg: string) => ({
    type: FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    failedMsg: msg,
});
export const updateExportRasterFormFields = (fieldValuePairs: FieldValuePair[]) => ({
    type: SET_RASTER_EXPORT_FORM_FIELDS,
    fieldValuePairs,
});

export const setCurrentRasterExportsToStore = (numberOfInboxMessages: number) => ({
    type: REQUEST_RASTER_EXPORTS,
    numberOfInboxMessages,
})

export const receivedTaskRasterExport = (id: ExportGridCellId) => ({
    type: RECEIVED_TASK_RASTER_EXPORT,
    id: id,
})

export const failedTaskRasterExport = (id: ExportGridCellId) => ({
    type: FAILED_TASK_RASTER_EXPORT,
    id: id,
})
export const receivedProjections = (projections: Projection[]) => ({
    type: RECEIVED_PROJECTIONS,
    projections,
})
export const setFetchingStateProjections = (fetchingState: FetchingState) => ({
    type: FETCHING_STATE_PROJECTIONS,
    fetchingState,
})

export const setNoDataValue = (value: number) => ({
    type: SET_NO_DATA_VALUE,
    noDataValue: value
})

const fieldValuePairContainsFieldThatShouldResetGridCells = (fieldValuePair: FieldValuePair) => {
    return fieldValuePair.field === 'projection' ||
        fieldValuePair.field === 'resolution' ||
        fieldValuePair.field === 'tileWidth' ||
        fieldValuePair.field === 'tileHeight'
}
const fieldValuePairsListContainsFieldThatShouldResetGridCells = (fieldValuePairs: FieldValuePair[]) => {
    return !!fieldValuePairs.find(fieldValuePairContainsFieldThatShouldResetGridCells);
}

export const updateExportFormAndFetchExportGridCells = (rasterUuid: string, fieldValuePairesToUpdate: FieldValuePair[]): Thunk => (dispatch, getState) => {
    if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
        dispatch(removeAllExportGridCells());
    }
    dispatch(updateExportRasterFormFields(fieldValuePairesToUpdate));

    const state = getState();
    const rasterExportState = getRasterExportState(state);
    const resolution = rasterExportState.resolution;
    const projection = rasterExportState.projection;
    const tileWidth = rasterExportState.tileWidth;
    const tileHeight = rasterExportState.tileHeight;
    const bounds = rasterExportState.bounds;
    const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;

    request
        .get(`/api/v4/rasters/${rasterUuid}/grid/?projection=${projection}&cell_size=${resolution}&tile_height=${tileHeight}&tile_width=${tileWidth}&bbox=${boundsString}`)
        .then(response => {
            const gridCells = response.body.features;

            const newState = getState();
            const newRasterExportState = getRasterExportState(newState);
            const newResolution = newRasterExportState.resolution;
            const newProjection = newRasterExportState.projection;
            const newTileWidth = newRasterExportState.tileWidth;
            const newTileHeight = newRasterExportState.tileHeight;

            if (
                // only update the gridcells if the values for which the request was done were not changed
                newResolution === resolution &&
                newProjection === projection &&
                newTileWidth === tileWidth &&
                newTileHeight === tileHeight
            ) {
                if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
                    dispatch(removeAllExportGridCells());
                }
                dispatch(retrievedGridCells(gridCells));
            }
        })
        .catch(error => {
            console.error(error);
            dispatch(failedRetrievingRasterExportGridcells(error + ''));
        })
};

export const requestRasterExports = (numberOfInboxMessages: number, openDownloadModal: Function, rasterUuid: string): Thunk => (dispatch, getState) => {

    dispatch(setCurrentRasterExportsToStore(numberOfInboxMessages));

    const state = getState();
    const rasterExportState = getRasterExportState(state);
    const selectedGridCellIds = rasterExportState.selectedGridCellIds;
    const projection = rasterExportState.projection;
    const tileWidth = rasterExportState.tileWidth;
    const tileHeight = rasterExportState.tileHeight;
    const start = rasterExportState.dateTimeStart;
    const noDataValue = rasterExportState.noDataValue;
    const availableGridCells = rasterExportState.availableGridCells;

    selectedGridCellIds.forEach((id) => {
        const currentGrid = availableGridCells.find(cell => { return areGridCelIdsEqual(cell.properties.id, id) });
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

export const requestProjections = (rasterUuid: string): Thunk => async dispatch => {
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

export const addTimeseriesExportTask = (numberOfInboxMessages: number, taskUuid: string): Thunk => dispatch => {
    dispatch(requestTimeseriesExport(numberOfInboxMessages));
    dispatch({
        type: ADD_TIMESERIES_EXPORT_TASK,
        taskUuid
    });
};

// MARK: Notification center
export const DISMISS_NOTIFICATION = "DISMISS_NOTIFICATION";
export const SHOW_NOTIFICATION = "SHOW_NOTIFICATION";

const showNotification = (message: string) => ({
    type: SHOW_NOTIFICATION,
    message
});

export const dismissNotification = () => ({
    type: DISMISS_NOTIFICATION
});

export const addNotification = (message: string, timeout?: number): Thunk => dispatch => {
    if (timeout) {
        setTimeout(() => {
            dispatch(dismissNotification());
        }, timeout);
    };
    dispatch(showNotification(message));
};