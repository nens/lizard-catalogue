import { combineReducers } from 'redux';
import {
    RASTERS_FETCHED,
    BASKET_UPDATED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    ITEM_REMOVED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP,
    REQUEST_WMS,
    RECEIVE_WMS,
    SWITCH_DATA_TYPE,
    ITEM_SELECTED,
    UPDATE_ORGANISATION_CHECKBOX,
    UPDATE_OBSERVATION_CHECKBOX,
} from "./action";
import {
    RastersFetched,
    RasterActionType,
    Raster,
    ObservationType,
    Organisation,
    Basket,
    OrganisationsFetched,
    ObservationTypesFetched,
    Bootstrap,
    BootstrapActionType,
    WMS,
    SwitchDataType,
    ItemSelected,
    UpdateOrganisationCheckbox,
    UpdateObservationTypeCheckbox,
} from './interface';

export interface MyStore {
    bootstrap: Bootstrap,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    currentDataType: string,
    currentRasterList: {
        count: number,
        previous: string | null,
        next: string | null,
        rasterList: string[],
        isFetching: boolean
    } | null,
    allRasters: {
        [index: string]: Raster,
    } | {},
    currentWMSList: {
        count: number,
        previous: string | null,
        next: string | null,
        wmsList: string[],
        isFetching: boolean
    } | null,
    allWMS: {
        [index: string]: WMS,
    } | {},
    selectedItem: string | null,
    basket: string[]
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
                isFetching: true
            }
        case RASTERS_FETCHED:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                rasterList: action.payload.results.map(raster => raster.uuid),
                isFetching: false
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
                newState[raster.uuid] = raster;
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
                isFetching: true
            }
        case RECEIVE_WMS:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                wmsList: action.payload.results.map(wms => wms.uuid),
                isFetching: false
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

const selectedItem = (state: MyStore['selectedItem'] = null, action: ItemSelected): MyStore['selectedItem'] => {
    switch (action.type) {
        case ITEM_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

const basket = (state: MyStore['basket'] = [], action: Basket): MyStore['basket'] => {
    switch (action.type) {
        case BASKET_UPDATED:
            const newState = [...state, ...action.payload];
            return newState.filter((item, pos) => newState.indexOf(item) === pos);
        case ITEM_REMOVED:
            const newState2 = [...state];
            const index = newState2.indexOf(action.payload);
            newState2.splice(index, 1);
            return newState2;
        default:
            return state;
    };
};

const observationTypes = (state: MyStore['observationTypes'] = [], action: ObservationTypesFetched & UpdateObservationTypeCheckbox): MyStore['observationTypes'] => {
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
        case UPDATE_OBSERVATION_CHECKBOX:
            const observationTypes = [...state];
            const checkedObservationType = action.payload;
            return observationTypes.map(obsType => {
                if (obsType.code === checkedObservationType.code) {
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

const organisations = (state: MyStore['organisations'] = [], action: OrganisationsFetched & UpdateOrganisationCheckbox): MyStore['organisations'] => {
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
        case UPDATE_ORGANISATION_CHECKBOX:
            const organisations = [...state];
            const checkedOrganisation = action.payload
            return organisations.map(organisation => {
                if (organisation.uuid === checkedOrganisation.uuid) {
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

export default combineReducers({
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
});