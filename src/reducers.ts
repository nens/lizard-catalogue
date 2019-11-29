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
    TOGGLE_ALERT,
    UPDATE_BASKET_WITH_RASTER,
    REMOVE_RASTER_FROM_BASKET,
    UPDATE_BASKET_WITH_WMS,
    REMOVE_WMS_FROM_BASKET,
    SELECT_ORGANISATION,
    SELECT_DATASET,
    SELECT_OBSERVATIONTYPE,
    UPDATE_SEARCH,
    REMOVE_ORGANISATION,
    REMOVE_DATASET,
    REMOVE_OBSERVATIONTYPE,
    REMOVE_SEARCH,
    UPDATE_ORDER,
    UPDATE_PAGE,
} from "./action";
import {
    Raster,
    ObservationType,
    Organisation,
    Dataset,
    Bootstrap,
    WMS,
    SwitchDataType,
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
    filters: {
        organisation: Organisation['name'],
        dataset: Dataset['slug'],
        observationType: ObservationType['parameter'],
        searchTerm: string,
        ordering: string,
        page: number,
    },
};

const bootstrap = (
    state: MyStore['bootstrap'] = {
        user: {
            first_name: null,
            username: null,
            authenticated: false
        },
        isFetching: false
    },
    action
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

const currentRasterList = (state: MyStore['currentRasterList'] = null, action): MyStore['currentRasterList'] => {
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

const allRasters = (state: MyStore['allRasters'] = {}, action): MyStore['allRasters'] => {
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

const currentWMSList = (state: MyStore['currentWMSList'] = null, action): MyStore['currentWMSList'] => {
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

const allWMS = (state: MyStore['allWMS'] = {}, action): MyStore['allWMS'] => {
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

const selectedItem = (state: MyStore['selectedItem'] = null, { type, uuid }): MyStore['selectedItem'] => {
    switch (type) {
        case ITEM_SELECTED:
            return uuid;
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

const observationTypes = (state: MyStore['observationTypes'] = [], { type, observationTypes }): MyStore['observationTypes'] => {
    switch (type) {
        case OBSERVATION_TYPES_FETCHED:
            //Remove observation types with empty parameter
            const observationTypesWithoutEmptyNames = observationTypes.filter(observationType => observationType.parameter !== '');

            //Remove duplicates in parameters using reduce() method
            const parameters = observationTypesWithoutEmptyNames.map(observationType => observationType.parameter);
            const parametersWithoutDuplicates = parameters.reduce((a: string[], b) => {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);
            const filteredObservationTypes = parametersWithoutDuplicates.map(parameter => {
                return observationTypesWithoutEmptyNames.find(observationType => observationType.parameter === parameter);
            });

            //Update Redux state
            return filteredObservationTypes.map(observation => {
                return {
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

const organisations = (state: MyStore['organisations'] = [], { type, organisations }): MyStore['organisations'] => {
    switch (type) {
        case ORGANISATIONS_FETCHED:
            //Remove organisations with empty name
            const organisationsWithoutEmptyNames = organisations.filter(organisation => organisation.name !== '');

            //Remove duplications in organisation name using reduce() method
            const names = organisationsWithoutEmptyNames.map(organisation => organisation.name);
            const namesWithoutDuplicates = names.reduce((a: string[], b) => {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);
            const filteredOrganisations = namesWithoutDuplicates.map(name => {
                return organisationsWithoutEmptyNames.find(organisation => organisation.name === name);
            });

            //Update Redux state
            return filteredOrganisations.map(organisation => {
                return {
                    url: organisation.url,
                    name: organisation.name,
                    uuid: organisation.uuid,
                };
            });
        default:
            return state;
    };
};

const datasets = (state: MyStore['datasets'] = [], { type, datasets }): MyStore['datasets'] => {
    switch (type) {
        case DATASETS_FETCHED:
            return datasets
                //Remove datasets with empty slug name
                .filter(dataset => dataset.slug !== '')
                .map(dataset => {
                    return {
                        slug: dataset.slug,
                        organisation: dataset.organisation,
                    };
                });
        default:
            return state;
    };
};

//Filters
const filters =(
    state: MyStore['filters'] = {
        organisation: '',
        dataset: '',
        observationType: '',
        searchTerm: '',
        ordering: '',
        page: 1,
    },
    { type, organisation, dataset, observationType, searchTerm, ordering, page }
): MyStore['filters'] => {
    switch (type) {
        case UPDATE_PAGE:
            return {
                ...state,
                page
            };
        case SELECT_ORGANISATION:
            return {
                ...state,
                organisation
            };
        case SELECT_DATASET:
            return {
                ...state,
                dataset
            };
        case SELECT_OBSERVATIONTYPE:
            return {
                ...state,
                observationType
            };
        case UPDATE_SEARCH:
            return {
                ...state,
                searchTerm
            };
        case UPDATE_ORDER:
            return {
                ...state,
                ordering: state.ordering === ordering ? `-${ordering}` : ordering
            };
        case REMOVE_ORGANISATION:
            return {
                ...state,
                organisation: ''
            };
        case REMOVE_DATASET:
            return {
                ...state,
                dataset: ''
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
        default:
            return state;
    };
};

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
    return state.observationTypes;
};

export const getOrganisations = (state: MyStore) => {
    return state.organisations;
};

export const getDatasets = (state: MyStore) => {
    return state.datasets;
};

export default combineReducers({
    bootstrap,
    currentDataType,
    currentRasterList,
    allRasters,
    currentWMSList,
    allWMS,
    filters,
    selectedItem,
    basket,
    observationTypes,
    organisations,
    datasets,
});