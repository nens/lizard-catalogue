import { combineReducers, AnyAction } from 'redux';
import { uniqWith, differenceWith } from 'lodash';

import {
    RASTERS_FETCHED,
    RASTER_FETCHED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    LAYERCOLLECTIONS_FETCHED,
    PROJECTS_FETCHED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP,
    REQUEST_WMS,
    RECEIVE_WMS_LAYERS,
    RECEIVE_WMS_LAYER,
    SWITCH_DATA_TYPE,
    ITEM_SELECTED,
    TOGGLE_ALERT,
    UPDATE_BASKET_WITH_RASTER,
    REMOVE_RASTER_FROM_BASKET,
    UPDATE_BASKET_WITH_WMS,
    REMOVE_WMS_FROM_BASKET,
    UPDATE_BASKET_WITH_SCENARIOS,
    REMOVE_SCENARIO_FROM_BASKET,
    REQUEST_INBOX,
    REMOVE_MESSAGE,
    DOWNLOAD_FILE,
    ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
    REQUESTED_RASTER_EXPORT_GRIDCELLS,
    RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    SET_RASTER_EXPORT_FORM_FIELDS,
    REMOVE_ALL_EXPORT_GRID_CELLS,
    REQUEST_RASTER_EXPORTS,
    RECEIVED_TASK_RASTER_EXPORT,
    RECEIVED_PROJECTIONS,
    FETCHING_STATE_PROJECTIONS,
    SELECT_ORGANISATION,
    SELECT_LAYERCOLLECTION,
    SELECT_PROJECT,
    SELECT_OBSERVATIONTYPE,
    UPDATE_SEARCH,
    REMOVE_ORGANISATION,
    REMOVE_LAYERCOLLECTION,
    REMOVE_PROJECT,
    REMOVE_OBSERVATIONTYPE,
    REMOVE_SEARCH,
    REMOVE_ORDER,
    UPDATE_ORDER,
    UPDATE_PAGE,
    REMOVE_CURRENT_EXPORT_TASKS,
    REQUEST_MONITORING_NETWORKS,
    RECEIVE_MONITORING_NETWORKS,
    RECEIVE_MONITORING_NETWORK,
    REQUEST_TIMESERIES,
    RECEIVE_TIMESERIES,
    REQUEST_LOCATIONS,
    RECEIVE_LOCATIONS,
    REQUEST_NETWORK_OBSERVATION_TYPES,
    RECEIVE_NETWORK_OBSERVATION_TYPES,
    REMOVE_TIMESERIES,
    SHOW_NOTIFICATION,
    DISMISS_NOTIFICATION,
    ADD_TIMESERIES_EXPORT_TASK,
    REQUEST_TIMESERIES_EXPORT,
    USER_ORGANISATIONS_FETCHED,
    SET_NO_DATA_VALUE,
    REQUEST_SCENARIOS,
    RECEIVE_SCENARIOS,
    RECEIVE_SCENARIO,
} from "./action";
import {
    Raster,
    ObservationType,
    Organisation,
    Layercollection,
    Bootstrap,
    WMS,
    Message,
    RasterExportState,
    MonitoringNetwork,
    TimeSeries,
    Location,
    Scenario,
    FieldValuePair,
    Project
} from './interface';
import { areGridCelIdsEqual, haveGridCellsSameId } from './utils/rasterExportUtils';
import { getSpatialBounds, getGeometry } from './utils/getSpatialBounds';
import { getRasterStyle } from './utils/getRasterStyle';

export interface MyStore {
    bootstrap: Bootstrap,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    layercollections: Layercollection[],
    projects: Project[],
    currentDataType: 'Raster' | 'WMS' | 'Timeseries' | 'Scenario' | '',
    currentRasterList: {
        count: number,
        previous: string | null,
        next: string | null,
        rasterList: string[],
        isFetching: boolean,
        showAlert: boolean
    } | null,
    allRasters: {
        [index: string]: Raster,
    },
    currentWMSList: {
        count: number,
        previous: string | null,
        next: string | null,
        wmsList: string[],
        isFetching: boolean,
        showAlert: boolean
    } | null,
    allWMS: {
        [index: string]: WMS,
    },
    currentScenariosList: {
        count: number,
        previous: string | null,
        next: string | null,
        scenariosList: string[],
        isFetching: boolean,
        showAlert: boolean,
    } | null,
    allScenarios: {
        [index: string]: Scenario,
    },
    currentMonitoringNetworkList: {
        count: number,
        previous: string | null,
        next: string | null,
        monitoringNetworksList: string[],
        isFetching: boolean,
        showAlert: boolean,
    } | null,
    allMonitoringNetworks: {
        [index: string]: MonitoringNetwork,
    },
    timeseriesObject: {
        isFetching: boolean,
        timeseries: {
            [uuid: string]: TimeSeries
        },
        observationTypes: {
            [id: string]: ObservationType
        },
    } | null,
    observationTypeObject: {
        isFetching: boolean,
        count: number,
        observationTypes: ObservationType[],
    } | null,
    locationsObject: {
        isFetching: boolean,
        locations: {
            [uuid: string]: Location
        },
        spatialBounds: number[][],
    } | null,
    selectedItem: string,
    basket: {
        rasters: string[],
        wmsLayers: string[],
        scenarios: string[]
    },
    inbox: Message[],
    rasterExportState: RasterExportState,
    filters: {
        organisation: Organisation['name'],
        layercollection: Layercollection['slug'],
        project: Project['name'],
        observationType: ObservationType['parameter'],
        searchTerm: string,
        ordering: string,
        page: number,
    },
    notification: string,
    timeseriesExport: {
        [task_uuid: string]: string
    }
};

const rasterExportState = (state: MyStore["rasterExportState"] = {
    selectedGridCellIds: [],
    fetchingStateGrid: "NOT_SENT",
    fetchingStateGridMsg: "",
    fetchingStateTasks: "NOT_SENT",
    availableGridCells: [],
    resolution: 100,
    projection: "EPSG:28992",
    tileWidth: 1000,
    tileHeight: 1000,
    bounds: {
        north: 1,
        east: 1,
        south: 1,
        west: 1,
    },
    rasterExportRequests: [],
    dateTimeStart: '',
    numberOfinboxMessagesBeforeRequest: 0,
    projectionsAvailableForCurrentRaster: {
        fetchingState: "NOT_SENT",
        projections: [],
    }
},
    action: AnyAction
): MyStore['rasterExportState'] => {
    switch (action.type) {
        case ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS:
            return {
                ...state,
                selectedGridCellIds: uniqWith( state.selectedGridCellIds.concat(action.gridCellIds),  areGridCelIdsEqual)
            }
        case REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS:
            return {
                ...state,
                selectedGridCellIds: differenceWith(state.selectedGridCellIds, action.gridCellIds, areGridCelIdsEqual)
            }
        case REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS:
            return {
                ...state,
                selectedGridCellIds: [],
            }
        case REMOVE_ALL_EXPORT_GRID_CELLS: 
            return {
                ...state,
                availableGridCells: [],
                selectedGridCellIds: [],
            }
        case REQUESTED_RASTER_EXPORT_GRIDCELLS:
            return {
                ...state,
                fetchingStateGrid: "SENT"
            }
        
        case RETRIEVED_RASTER_EXPORT_GRIDCELLS:
            return {
                ...state,
                fetchingStateGrid: "RECEIVED",
                availableGridCells: uniqWith( state.availableGridCells.concat(action.gridCells),  haveGridCellsSameId),
            } 
        case FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS: 
            return {
                ...state,
                fetchingStateGrid: "FAILED",
                fetchingStateGridMsg: action.failedMsg,
            }
        case SET_RASTER_EXPORT_FORM_FIELDS:
            {
                const stateCopy = {...state}
                action.fieldValuePairs.forEach((fieldValuePair: FieldValuePair) => {
                    Object.assign(stateCopy, {[fieldValuePair.field]: fieldValuePair.value})
                })
                return {
                    ...stateCopy,
                    fetchingStateGrid: "SENT",
                }
            }
        case REQUEST_RASTER_EXPORTS:
            return {
                ...state,
                rasterExportRequests: state.selectedGridCellIds.map(selectedId=>{
                    return {
                        fetchingState: "SENT",
                        id: selectedId,
                        projection: state.projection,
                        bounds: state.bounds,
                        resolution: state.resolution,
                        tileWidth: state.tileWidth,
                        tileHeight: state.tileHeight,
                    }
                }),
                numberOfinboxMessagesBeforeRequest: action.numberOfInboxMessages,
            }
        case REQUEST_TIMESERIES_EXPORT:
            return {
                ...state,
                numberOfinboxMessagesBeforeRequest: action.numberOfInboxMessages,
            }
        case RECEIVED_TASK_RASTER_EXPORT:
            return {
                ...state,
                rasterExportRequests: state.rasterExportRequests.map(exportItem=>{
                    if (areGridCelIdsEqual(exportItem.id, action.id)) {
                        return {
                            ...exportItem,
                            fetchingState: "RECEIVED",
                        }
                    }
                    else {
                        return exportItem;
                    }
                }),
            }
        case RECEIVED_PROJECTIONS:
            return {
                ...state,
                projectionsAvailableForCurrentRaster: {
                    fetchingState: "RECEIVED",
                    projections: action.projections,
                }
            }
        case FETCHING_STATE_PROJECTIONS:
            return {
                ...state,
                projectionsAvailableForCurrentRaster: {
                    ...state.projectionsAvailableForCurrentRaster,
                    fetchingState: action.fetchingState,
                }
            }
        case REMOVE_CURRENT_EXPORT_TASKS:
            return {
                ...state,
                rasterExportRequests: [],
                numberOfinboxMessagesBeforeRequest: 0,
            }
        case SET_NO_DATA_VALUE:
            return {
                ...state,
                noDataValue: action.noDataValue
            }
        default:
            return state;
    }
}

const bootstrap = (
    state: MyStore['bootstrap'] = {
        user: {
            id: null,
            first_name: null,
            username: null,
            authenticated: false
        },
        isFetching: false
    },
    action: AnyAction
): MyStore['bootstrap'] => {
    switch (action.type) {
        case REQUEST_LIZARD_BOOTSTRAP:
            return { ...state, isFetching: true };
        case RECEIVE_LIZARD_BOOTSTRAP:
            const { user } = action.payload;
            return {
                ...state,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    username: user.username,
                    authenticated: user.authenticated
                },
                isFetching: false
            };
        default:
            return state;
    }
};

const currentDataType = (state: MyStore['currentDataType'] = '', action: AnyAction): MyStore['currentDataType'] => {
    switch (action.type) {
        case SWITCH_DATA_TYPE:
            return action.payload;
        default:
            return state;
    };
};

const currentRasterList = (state: MyStore['currentRasterList'] = null, action: AnyAction): MyStore['currentRasterList'] => {
    switch (action.type) {
        case RASTERS_REQUESTED:
            return {
                count: 0,
                previous: null,
                next: null,
                rasterList: [],
                isFetching: true,
                showAlert: false
            }
        case RASTERS_FETCHED:
            const { count, previous, next, results } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                rasterList: results.map((raster: Raster) => raster.uuid),
                isFetching: false,
                showAlert: count === 0 ? true : false
            };
        case TOGGLE_ALERT:
            if (state) {
                return {
                    ...state,
                    showAlert: false
                }
            } else {
                return state;
            };
        default:
            return state;
    };
};

const allRasters = (state: MyStore['allRasters'] = {}, action: AnyAction): MyStore['allRasters'] => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const newState = { ...state };
            action.payload.results.forEach((raster: Raster) => {
                newState[raster.uuid] = getRasterStyle(raster);
            });
            return newState;
        case RASTER_FETCHED:
            const raster = action.raster;
            return {
                ...state,
                [raster.uuid]: getRasterStyle(raster)
            };
        default:
            return state;
    };
};

const currentWMSList = (state: MyStore['currentWMSList'] = null, action: AnyAction): MyStore['currentWMSList'] => {
    switch (action.type) {
        case REQUEST_WMS:
            return {
                count: 0,
                previous: null,
                next: null,
                wmsList: [],
                isFetching: true,
                showAlert: false
            }
        case RECEIVE_WMS_LAYERS:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                wmsList: action.payload.results.map((wms: WMS) => wms.uuid),
                isFetching: false,
                showAlert: count === 0 ? true : false
            };
        case TOGGLE_ALERT:
            if (state) {
                return {
                    ...state,
                    showAlert: false
                }
            } else {
                return state;
            };
        default:
            return state;
    };
};

const allWMS = (state: MyStore['allWMS'] = {}, action: AnyAction): MyStore['allWMS'] => {
    switch (action.type) {
        case RECEIVE_WMS_LAYERS:
            const newState = { ...state };
            action.payload.results.forEach((wms: WMS) => {
                newState[wms.uuid] = wms;
            });
            return newState;
        case RECEIVE_WMS_LAYER:
            const wms = action.wms;
            return {
                ...state,
                [wms.uuid]: wms
            };
        default:
            return state;
    };
};

const currentScenariosList = (state: MyStore['currentScenariosList'] = null, action: AnyAction): MyStore['currentScenariosList'] => {
    switch (action.type) {
        case REQUEST_SCENARIOS:
            return {
                count: 0,
                previous: null,
                next: null,
                scenariosList: [],
                isFetching: true,
                showAlert: false
            }
        case RECEIVE_SCENARIOS:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                scenariosList: action.payload.results.map((scenario: Scenario) => scenario.uuid),
                isFetching: false,
                showAlert: count === 0 ? true : false
            };
        case TOGGLE_ALERT:
            if (state) {
                return {
                    ...state,
                    showAlert: false
                }
            } else {
                return state;
            };
        default:
            return state;
    };
};

const allScenarios = (state: MyStore['allScenarios'] = {}, action: AnyAction): MyStore['allScenarios'] => {
    switch (action.type) {
        case RECEIVE_SCENARIOS:
            const newState = { ...state };
            action.payload.results.forEach((scenario: Scenario) => {
                newState[scenario.uuid] = scenario;
            });
            return newState;
        case RECEIVE_SCENARIO:
            const scenario = action.scenario;
            return {
                ...state,
                [scenario.uuid]: scenario
            };
        default:
            return state;
    };
};

const currentMonitoringNetworkList = (state: MyStore['currentMonitoringNetworkList'] = null, action: AnyAction): MyStore['currentMonitoringNetworkList'] => {
    switch (action.type) {
        case REQUEST_MONITORING_NETWORKS:
            return {
                count: 0,
                previous: null,
                next: null,
                monitoringNetworksList: [],
                isFetching: true,
                showAlert: false
            }
        case RECEIVE_MONITORING_NETWORKS:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                monitoringNetworksList: action.payload.results.map((network: MonitoringNetwork) => network.uuid),
                isFetching: false,
                showAlert: count === 0 ? true : false
            };
        case TOGGLE_ALERT:
            if (state) {
                return {
                    ...state,
                    showAlert: false
                }
            } else {
                return state;
            };
        default:
            return state;
    };
};

const allMonitoringNetworks = (state: MyStore['allMonitoringNetworks'] = {}, action: AnyAction): MyStore['allMonitoringNetworks'] => {
    switch (action.type) {
        case RECEIVE_MONITORING_NETWORKS:
            const newState = { ...state };
            action.payload.results.forEach((network: MonitoringNetwork) => {
                newState[network.uuid] = network;
            });
            return newState;
        case RECEIVE_MONITORING_NETWORK:
            const monitoringNetwork = action.monitoringNetwork;
            return {
                ...state,
                [monitoringNetwork.uuid]: monitoringNetwork
            };
        default:
            return state;
    };
};

const timeseriesObject = (state: MyStore['timeseriesObject'] = null, action: AnyAction): MyStore['timeseriesObject'] => {
    switch(action.type) {
        case REQUEST_TIMESERIES:
            return {
                isFetching: true,
                timeseries: {},
                observationTypes: {},
            }
        case RECEIVE_TIMESERIES:
            const { timeseriesList } = action;
            const timeseries: { [uuid: string]: TimeSeries } = {};
            const observationTypes: { [id: string]: ObservationType } = {};
            timeseriesList.forEach((ts: TimeSeries) => {
                if (!ts.observation_type) return;
                observationTypes[ts.observation_type.id] = ts.observation_type;
                timeseries[ts.uuid] = ts;
            });
            return {
                isFetching: false,
                timeseries,
                observationTypes
            };
        case REMOVE_TIMESERIES:
            return null;
        default:
            return state;
    };
};

const observationTypeObject = (state: MyStore['observationTypeObject'] = null, action: AnyAction): MyStore['observationTypeObject'] => {
    switch(action.type) {
        case REQUEST_NETWORK_OBSERVATION_TYPES:
            return {
                isFetching: true,
                observationTypes: [],
                count: 0,
            }
        case RECEIVE_NETWORK_OBSERVATION_TYPES:
            return {
                isFetching: false,
                observationTypes: action.observationTypeList,
                count: action.count,
            }
        default:
            return state;
    };
};

const locationsObject = (state: MyStore['locationsObject'] = null, action: AnyAction): MyStore['locationsObject'] => {
    switch(action.type) {
        case REQUEST_LOCATIONS:
            return {
                isFetching: true,
                locations: {},
                spatialBounds: [[85, 180], [-85, -180]]
            }
        case RECEIVE_LOCATIONS:
            const locationsList: Location[] = action.locationsList;
            const locations: { [uuid: string]: Location} = {};
            locationsList.forEach(location => {
                locations[location.uuid] = {
                    ...location,
                    geometry: getGeometry(location)
                };
            });
            return {
                isFetching: false,
                locations,
                spatialBounds: getSpatialBounds(locationsList) || [[85, 180], [-85, -180]],
            };
        default:
            return state;
    };
};

const selectedItem = (state: MyStore['selectedItem'] = '', action: AnyAction): MyStore['selectedItem'] => {
    switch (action.type) {
        case ITEM_SELECTED:
            return action.uuid;
        default:
            return state;
    };
};

const basket = (
    state: MyStore['basket'] = {
        rasters: [],
        wmsLayers: [],
        scenarios: []
    },
    action: AnyAction
) => {
    switch (action.type) {
        case UPDATE_BASKET_WITH_RASTER:
            const rasters = [
                ...state.rasters,
                ...action.rasters
            ];
            return {
                ...state,
                //Remove duplicates in the rasters array
                rasters: rasters.filter((item, i) => rasters.indexOf(item) === i)
            };
        case REMOVE_RASTER_FROM_BASKET:
            const index = state.rasters.indexOf(action.uuid);
            return {
                ...state,
                rasters: state.rasters.filter((raster, i) => raster && i !== index)
            };
        case UPDATE_BASKET_WITH_WMS:
            const wmsLayers = [
                ...state.wmsLayers,
                ...action.wmsLayers
            ];
            return {
                ...state,
                //Remove duplicates in the WMS layers array
                wmsLayers: wmsLayers.filter((item, i) => wmsLayers.indexOf(item) === i)
            };
        case REMOVE_WMS_FROM_BASKET:
            const index2 = state.wmsLayers.indexOf(action.uuid);
            return {
                ...state,
                wmsLayers: state.wmsLayers.filter((wms, i) => wms && i !== index2)
            };
        case UPDATE_BASKET_WITH_SCENARIOS:
            const scenarios = [
                ...state.scenarios,
                ...action.scenarios
            ];
            return {
                ...state,
                //Remove duplicates in the scenarios array
                scenarios: scenarios.filter((item, i) => scenarios.indexOf(item) === i)
            };
        case REMOVE_SCENARIO_FROM_BASKET:
            const index3 = state.scenarios.indexOf(action.uuid);
            return {
                ...state,
                scenarios: state.scenarios.filter((scenario, i) => scenario && i !== index3)
            };
        default:
            return state;
    };
};

const observationTypes = (state: MyStore['observationTypes'] = [], action: AnyAction): MyStore['observationTypes'] => {
    switch (action.type) {
        case OBSERVATION_TYPES_FETCHED:
            const observationTypes: ObservationType[] = action.observationTypes;

            //Remove observation types with empty parameter
            const observationTypesWithoutEmptyNames = observationTypes.filter(observationType => observationType.parameter !== '');

            //Remove duplicates in parameters using reduce() method
            const parameters = observationTypesWithoutEmptyNames.map(observationType => observationType.parameter);
            const parametersWithoutDuplicates = parameters.reduce((a: string[], b) => {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);
            const filteredObservationTypes = parametersWithoutDuplicates.map(parameter => {
                return observationTypesWithoutEmptyNames.find(observationType => observationType.parameter === parameter)!;
            });

            //Update Redux state
            return filteredObservationTypes.map(observation => {
                return {
                    id: observation.id,
                    url: observation.url,
                    code: observation.code,
                    parameter: observation.parameter,
                    unit: observation.unit,
                    scale: observation.scale,
                    description: observation.description,
                };
            });
        default:
            return state;
    };
};

const organisations = (state: MyStore['organisations'] = [], action: AnyAction): MyStore['organisations'] => {
    switch (action.type) {
        case ORGANISATIONS_FETCHED:
            const organisations: Organisation[] = action.organisations;

            //Remove organisations with empty name
            const organisationsWithoutEmptyNames = organisations.filter(organisation => organisation.name !== '');

            //Remove duplications in organisation name using reduce() method
            const names = organisationsWithoutEmptyNames.map(organisation => organisation.name);
            const namesWithoutDuplicates = names.reduce((a: string[], b) => {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);
            const filteredOrganisations = namesWithoutDuplicates.map(name => {
                return organisationsWithoutEmptyNames.find(organisation => organisation.name === name)!;
            });

            //Update Redux state
            return filteredOrganisations;
        case USER_ORGANISATIONS_FETCHED:
            const listOfUserOrganisations = state.map(organisation => {
                const selectedOrganisation = action.organisations.find((org: Organisation) => org.uuid === organisation.uuid);
                if (selectedOrganisation) {
                    return selectedOrganisation;
                };
                return organisation;
            });
            return listOfUserOrganisations;
        default:
            return state;
    };
};

const layercollections = (state: MyStore['layercollections'] = [], action: AnyAction): MyStore['layercollections'] => {
    switch (action.type) {
        case LAYERCOLLECTIONS_FETCHED:
            const layercollections: Layercollection[] = action.layercollections;
            return layercollections.filter(
                layercollection => layercollection.slug !== ''
            ).map(layercollection => {
                return {
                    slug: layercollection.slug,
                    organisation: layercollection.organisation,
                };
            });
        default:
            return state;
    };
};

const projects = (state: MyStore['projects'] = [], action: AnyAction): MyStore['projects'] => {
    switch (action.type) {
        case PROJECTS_FETCHED:
            return action.projects;
        default:
            return state;
    };
};

//Filters
const filters =(
    state: MyStore['filters'] = {
        organisation: '',
        layercollection: '',
        project: '',
        observationType: '',
        searchTerm: '',
        ordering: '',
        page: 1,
    },
    action: AnyAction
    // { type, organisation, layercollection, observationType, searchTerm, ordering, page }
): MyStore['filters'] => {
    switch (action.type) {
        case UPDATE_PAGE:
            return {
                ...state,
                page: action.page
            };
        case SELECT_ORGANISATION:
            return {
                ...state,
                organisation: action.organisation
            };
        case SELECT_LAYERCOLLECTION:
            return {
                ...state,
                layercollection: action.layercollection
            };
        case SELECT_PROJECT:
            return {
                ...state,
                project: action.project
            };
        case SELECT_OBSERVATIONTYPE:
            return {
                ...state,
                observationType: action.observationType
            };
        case UPDATE_SEARCH:
            return {
                ...state,
                searchTerm: action.searchTerm
            };
        case UPDATE_ORDER:
            const ordering = action.ordering;
            return {
                ...state,
                ordering: state.ordering === ordering ? `-${ordering}` : ordering
            };
        case REMOVE_ORGANISATION:
            return {
                ...state,
                organisation: ''
            };
        case REMOVE_LAYERCOLLECTION:
            return {
                ...state,
                layercollection: ''
            };
        case REMOVE_PROJECT:
            return {
                ...state,
                project: ''
            };
        case REMOVE_OBSERVATIONTYPE:
            return {
                ...state,
                observationType: ''
            };
        case REMOVE_SEARCH:
            return {
                ...state,
                searchTerm: ''
            };
        case REMOVE_ORDER:
            return {
                ...state,
                ordering: ''
            };
        default:
            return state;
    };
};

const inbox = (state: MyStore['inbox'] = [], action: AnyAction) => {
    switch (action.type) {
        case REQUEST_INBOX:
            return action.messages.map((message: Message) => {
                const currentMessage = state.find(mess => mess.id === message.id);
                if (currentMessage) {
                    return {
                        ...currentMessage,
                        downloaded: currentMessage.downloaded
                    };
                } else {
                    return {
                        id: message.id,
                        message: message.message,
                        url: message.url,
                        downloaded: false,
                    };
                };
            });
        case DOWNLOAD_FILE:
            const newState = state.map(message => {
                if (message.id === action.id) {
                    return {
                        ...message,
                        downloaded: true
                    };
                };
                return message;
            });
            return newState;
        case REMOVE_MESSAGE:
            return state.filter(message => message.id !== action.id);
        default:
            return state;
    };
};

const notification = (state: MyStore['notification'] = '', action: AnyAction) => {
    switch (action.type) {
        case SHOW_NOTIFICATION:
            return action.message;
        case DISMISS_NOTIFICATION:
            return '';
        default:
            return state;
    };
};

const timeseriesExport = (state: MyStore['timeseriesExport'] = {}, action: AnyAction) => {
    switch (action.type) {
        case ADD_TIMESERIES_EXPORT_TASK:
            const taskUuid = action.taskUuid;
            return {
                ...state,
                [taskUuid]: taskUuid
            };
        case REMOVE_CURRENT_EXPORT_TASKS:
            return {};
        default:
            return state;
    };
};

export const getTimeseriesExport = (state: MyStore) => {
    return state.timeseriesExport;
}

export const getRasterExportState = (state: MyStore) => {
    return state.rasterExportState;
}

export const getIsFormValidForRequestingGridCells = (state: MyStore) => {
    const rasterExportState = state.rasterExportState;
    return (
        rasterExportState.resolution !== "" &&
        rasterExportState.projection !== "" &&
        rasterExportState.tileWidth !== "" &&
        rasterExportState.tileHeight !== ""
    );
}

export const getLizardBootstrap = (state: MyStore) => {
    return state.bootstrap;
};

export const getCurrentDataType = (state: MyStore) => {
    return state.currentDataType;
};

export const getCurrentRasterList = (state: MyStore) => {
    return state.currentRasterList;
};

export const getAllRasters = (state: MyStore) => {
    return state.allRasters;
};

export const getRaster = (state: MyStore, uuid: string) => {
    return state.allRasters[uuid];
};

export const getCurrentWMSList = (state: MyStore) => {
    return state.currentWMSList;
};

export const getAllWms = (state: MyStore) => {
    return state.allWMS;
};

export const getWMS = (state: MyStore, uuid: string): WMS => {
    return state.allWMS[uuid];
};

export const getCurrentScenariosList = (state: MyStore) => {
    return state.currentScenariosList;
};

export const getAllScenarios = (state: MyStore) => {
    return state.allScenarios;
};

export const getScenario = (state: MyStore, uuid: string): Scenario => {
    return state.allScenarios[uuid];
};

export const getCurrentMonitoringNetworkList = (state: MyStore) => {
    return state.currentMonitoringNetworkList;
};
export const getAllMonitoringNetworks = (state: MyStore) => {
    return state.allMonitoringNetworks;
};
export const getMonitoringNetwork = (state: MyStore, uuid: string) => {
    return state.allMonitoringNetworks[uuid];
};

export const getMonitoringNetworkObservationTypes = (state: MyStore) => {
    return state.observationTypeObject;
};
export const getMonitoringNetworkObservationTypesNotNull = (state: MyStore) => {
    if (!state.observationTypeObject) {
        throw new Error("getMonitoringNetworkObservationTypesNotNull is called when observation type object is null");
    };
    return state.observationTypeObject;
};

export const getTimeseriesObject = (state: MyStore) => {
    return state.timeseriesObject;
};
export const getTimeseriesObjectNotNull = (state: MyStore) => {
    if (!state.timeseriesObject) {
        throw new Error("getTimeseriesObject is called when timeseries object is null");
    };
    return state.timeseriesObject;
};

export const getLocationsObject = (state: MyStore) => {
    return state.locationsObject;
};
export const getLocationsObjectNotNull = (state: MyStore) => {
    if (!state.locationsObject) {
        throw new Error("getLocationsObject is called when locations object is null");
    };
    return state.locationsObject;
};

export const getObservationTypes = (state: MyStore) => {
    return state.observationTypes;
};

export const getOrganisations = (state: MyStore) => {
    return state.organisations;
};

export const getLayercollections = (state: MyStore) => {
    return state.layercollections;
};

export const getProjects = (state: MyStore) => {
    return state.projects;
};

export const getInbox = (state: MyStore) => {
    return state.inbox;
};

export const getSelectedItem = (state: MyStore) => {
    return state.selectedItem;
};

export const getNotification = (state: MyStore) => {
    return state.notification;
};

export const getFilters = (state: MyStore) => {
    return state.filters;
};

export const getNumberOfItemsInBasket = (state: MyStore) => {
    return state.basket.rasters.concat(state.basket.wmsLayers).concat(state.basket.scenarios).length;
};

export default combineReducers({
    rasterExportState,
    bootstrap,
    currentDataType,
    currentRasterList,
    allRasters,
    currentWMSList,
    allWMS,
    currentScenariosList,
    allScenarios,
    currentMonitoringNetworkList,
    allMonitoringNetworks,
    timeseriesObject,
    observationTypeObject,
    locationsObject,
    filters,
    selectedItem,
    basket,
    observationTypes,
    organisations,
    layercollections,
    projects,
    inbox,
    notification,
    timeseriesExport
});