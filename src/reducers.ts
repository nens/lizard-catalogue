import { combineReducers } from 'redux';
import {
    RASTERS_FETCHED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    DATASETS_FETCHED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP,
    REQUEST_WMS,
    RECEIVE_WMS,
    SWITCH_DATA_TYPE,
    ITEM_SELECTED,
    UPDATE_ORGANISATION_RADIOBUTTON,
    UPDATE_OBSERVATION_RADIOBUTTON,
    UPDATE_DATASET_RADIOBUTTON,
    TOGGLE_ALERT,
    UPDATE_BASKET_WITH_RASTER,
    REMOVE_RASTER_FROM_BASKET,
    UPDATE_BASKET_WITH_WMS,
    REMOVE_WMS_FROM_BASKET,
    REQUEST_INBOX,
    REMOVE_MESSAGE,
    DOWNLOAD_FILE,
    ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
} from "./action";
import {
    RastersFetched,
    RasterActionType,
    Raster,
    ObservationType,
    Organisation,
    Dataset,
    OrganisationsFetched,
    ObservationTypesFetched,
    DatasetsFetched,
    Bootstrap,
    BootstrapActionType,
    WMS,
    SwitchDataType,
    ItemSelected,
    UpdateOrganisationRadiobutton,
    UpdateObservationTypeRadiobutton,
    UpdateDatasetRadiobutton,
    WMSActionType,
    Message,
    RasterExportState,
} from './interface';

export interface MyStore {
    bootstrap: Bootstrap,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: 'Raster' | 'WMS',
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
    } | {},
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
    } | {},
    selectedItem: string | null,
    basket: {
        rasters: string[],
        wmsLayers: string[]
    },
    pendingExportTasks: number,
    inbox: Message[],
    rasterExportState: RasterExportState,
};

const rasterExportState = (state: MyStore["rasterExportState"]=
    {
    selectedGridCellIds: [[130, 510]],
    availableGridCells: [{
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[52.339322, 4.767822], [53.339322, 4.997822]],
        },
        "properties": {
          "projection": "EPSG:28992",
          "bounds": [130000, 510000, 140000, 520000],
          "id": [130, 510]
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[52.339322, 4.997822], [53.339322, 5.997822]],
        },
        "properties": {
          "projection": "EPSG:28992",
          "bounds": [130000, 510000, 140000, 520000],
          "id": [131, 510]
        }
      }
    ],
    },
    action: any
): MyStore['rasterExportState'] => {
    switch (action.type) {
        case ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS:
            return {
                ...state,
                selectedGridCellIds: action.gridCellIds
            }
        case REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS:
            return {
                ...state,
                selectedGridCellIds: state.selectedGridCellIds.filter(id => {
                    return action.gridCellIds.filter(actionId=> {
                        return id[0] === actionId[0] && id[1] === actionId[1]
                    }).length === 0;
                })
            }
        case REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS:
        return {
            ...state,
            selectedGridCellIds: [],
        }
        default:
            return state;
    }
}

const bootstrap = (
    state: MyStore['bootstrap'] = {
        user: {
            first_name: null,
            username: null,
            authenticated: false
        },
        isFetching: false
    },
    action: BootstrapActionType
): MyStore['bootstrap'] => {
    switch (action.type) {
        case REQUEST_LIZARD_BOOTSTRAP:
            return { ...state, isFetching: true };
        case RECEIVE_LIZARD_BOOTSTRAP:
            const { user } = action.payload
            return {
                ...state,
                user: {
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

const currentDataType = (state: MyStore['currentDataType'] = "Raster", action: SwitchDataType): MyStore['currentDataType'] => {
    switch (action.type) {
        case SWITCH_DATA_TYPE:
            return action.payload;
        default:
            return state;
    };
};

const currentRasterList = (state: MyStore['currentRasterList'] = null, action: RasterActionType): MyStore['currentRasterList'] => {
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
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                rasterList: action.payload.results.map(raster => raster.uuid),
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

const allRasters = (state: MyStore['allRasters'] = {}, action: RastersFetched): MyStore['allRasters'] => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const newState = { ...state };
            action.payload.results.forEach(raster => {
                //There is an exception with Regen raster as its WMS layer name and style
                //when sending request to get the WMS tile layer is not the same as other rasters
                //for regen, we should request for either "radar:5min" or "radar:hour" or "radar:day" for layers
                //and either "radar-5min" or "radar-hour" or "radar-day" for styles
                //Since the default value used in lizard-client is radar:hour, we will hardcode "radar:hour"
                //as regen's wms layer name and "radar-hour" as its styles
                //the UUIDs of regen raster on staging and on production are
                //"3e5f56a7-b16e-4deb-8449-cc2c88805159" and "730d6675-35dd-4a35-aa9b-bfb8155f9ca7" respectively
                let layerStyle = raster.options.styles ? raster.options.styles : "";
                let layerName = raster.wms_info.layer;
                if (raster.uuid === "3e5f56a7-b16e-4deb-8449-cc2c88805159" || raster.uuid === "730d6675-35dd-4a35-aa9b-bfb8155f9ca7") {
                    layerName = "radar:hour";
                    layerStyle = "radar-hour";
                };
                newState[raster.uuid] = {
                    ...raster,
                    options: {
                        styles: layerStyle
                    },
                    wms_info: {
                        ...raster.wms_info,
                        layer: layerName
                    }
                };
            });
            return newState;
        default:
            return state;
    };
};

const currentWMSList = (state: MyStore['currentWMSList'] = null, action: WMSActionType): MyStore['currentWMSList'] => {
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
        case RECEIVE_WMS:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                wmsList: action.payload.results.map(wms => wms.uuid),
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

const allWMS = (state: MyStore['allWMS'] = {}, action: WMSActionType): MyStore['allWMS'] => {
    switch (action.type) {
        case RECEIVE_WMS:
            const newState = { ...state };
            action.payload.results.forEach(wms => {
                newState[wms.uuid] = wms;
            });
            return newState;
        default:
            return state;
    };
};

const selectedItem = (state: MyStore['selectedItem'] = null, action: ItemSelected): MyStore['selectedItem'] => {
    switch (action.type) {
        case ITEM_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

const basket = (
    state: MyStore['basket'] = {
        rasters: [],
        wmsLayers: []
    },
    action
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
        default:
            return state;
    };
};

const observationTypes = (state: MyStore['observationTypes'] = [], action: ObservationTypesFetched & UpdateObservationTypeRadiobutton): MyStore['observationTypes'] => {
    switch (action.type) {
        case OBSERVATION_TYPES_FETCHED:
            return action.payload.map(observation => {
                return {
                    url: observation.url,
                    code: observation.code,
                    parameter: observation.parameter,
                    unit: observation.unit,
                    scale: observation.scale,
                    description: observation.description,
                    checked: false
                };
            });
        case UPDATE_OBSERVATION_RADIOBUTTON:
            const observationTypes = [...state];
            const checkedObservationTypeParameter = action.payload;
            return observationTypes.map(obsType => {
                if (obsType.parameter === checkedObservationTypeParameter) {
                    return {
                        ...obsType,
                        checked: !obsType.checked
                    };
                } else {
                    return {
                        ...obsType,
                        checked: false
                    };
                };
            })
        default:
            return state;
    };
};

const organisations = (state: MyStore['organisations'] = [], action: OrganisationsFetched & UpdateOrganisationRadiobutton): MyStore['organisations'] => {
    switch (action.type) {
        case ORGANISATIONS_FETCHED:
            return action.payload.map(organisation => {
                return {
                    url: organisation.url,
                    name: organisation.name,
                    uuid: organisation.uuid,
                    checked: false
                };
            });
        case UPDATE_ORGANISATION_RADIOBUTTON:
            const organisations = [...state];
            const checkedOrganisationName = action.payload
            return organisations.map(organisation => {
                if (organisation.name === checkedOrganisationName) {
                    return {
                        ...organisation,
                        checked: !organisation.checked
                    };
                } else {
                    return {
                        ...organisation,
                        checked: false
                    };
                };
            });
        default:
            return state;
    };
};

const datasets = (state: MyStore['datasets'] = [], action: DatasetsFetched & UpdateDatasetRadiobutton): MyStore['datasets'] => {
    switch (action.type) {
        case DATASETS_FETCHED:
            return action.payload.map(dataset => {
                return {
                    slug: dataset.slug,
                    organisation: dataset.organisation,
                    checked: false
                };
            });
        case UPDATE_DATASET_RADIOBUTTON:
            const datasets = [...state];
            const checkedDatasetSlug = action.payload
            return datasets.map(dataset => {
                if (dataset.slug === checkedDatasetSlug) {
                    return {
                        ...dataset,
                        checked: !dataset.checked
                    };
                } else {
                    return {
                        ...dataset,
                        checked: false
                    };
                };
            });
        default:
            return state;
    };
};

const pendingExportTasks = (state: MyStore['pendingExportTasks'] = 20, { type }): MyStore['pendingExportTasks'] => {
    switch (type) {
        default:
            return state;
    };
};

const inbox = (state: MyStore['inbox'] = [], { type, messages, id }) => {
    switch (type) {
        case REQUEST_INBOX:
            return messages.map(message => {
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
                if (message.id === id) {
                    return {
                        ...message,
                        downloaded: true
                    };
                };
                return message;
            });
            return newState;
        case REMOVE_MESSAGE:
            return state.filter(message => message.id !== id);
        default:
            return state;
    };
};

export const getExportAvailableGridCells = (state: MyStore) => {
    return state.rasterExportState.availableGridCells;
}
export const getExportSelectedGridCellIds = (state: MyStore) => {
    return state.rasterExportState.selectedGridCellIds;
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

export const getRaster = (state: MyStore, uuid: string) => {
    return state.allRasters[uuid];
};

export const getCurrentWMSList = (state: MyStore) => {
    return state.currentWMSList;
};

export const getWMS = (state: MyStore, uuid: string) => {
    return state.allWMS[uuid];
};

export const getObservationTypes = (state: MyStore) => {
    //Remove observation types with empty parameter
    const observationTypes = state.observationTypes.filter(observationType => observationType.parameter !== "");

    //Remove duplicates in parameters using reduce() method
    const parameters = observationTypes.map(observationType => observationType.parameter);
    const parametersWithoutDuplicates = parameters.reduce((a: string[], b) => {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);

    //Return all observation types based on their parameters
    //For observation types with same parameters (i.e. waterhoogte), only select one of them as we are interested in getting one single result only
    //So in this case, we select the first one from the array
    return parametersWithoutDuplicates.map(parameter => {
        //Get all the observation types with this parameter and select the first one
        return observationTypes.filter(observationType => observationType.parameter === parameter)[0];
    });
};

export const getOrganisations = (state: MyStore) => {
    //Remove organisations with empty name
    return state.organisations.filter(organisation => organisation.name !== "");
}

export const getDatasets = (state: MyStore) => {
    //Remove datasets with empty name
    return state.datasets.filter(dataset => dataset.slug !== "");
}

export default combineReducers({
    rasterExportState,
    bootstrap,
    currentDataType,
    currentRasterList,
    allRasters,
    currentWMSList,
    allWMS,
    selectedItem,
    basket,
    observationTypes,
    organisations,
    datasets,
    pendingExportTasks,
    inbox,
});