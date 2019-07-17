import { combineReducers } from 'redux';
import {
    RASTERS_FETCHED,
    RASTER_SELECTED,
    BASKET_UPDATED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    ITEM_REMOVED,
    RASTERS_REQUESTED,
    REQUEST_LIZARD_BOOTSTRAP,
    RECEIVE_LIZARD_BOOTSTRAP
} from "./action";
import {
    RastersFetched,
    RasterSelected,
    RasterActionType,
    Raster,
    ObservationType,
    Organisation,
    Basket,
    OrganisationsFetched,
    ObservationTypesFetched,
    Bootstrap,
    BootstrapActionType,
} from './interface';

export interface MyStore {
    bootstrap: Bootstrap,
    observationTypes: ObservationType[],
    organisations: Organisation[],
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
    selectedRaster: string | null,
    basket: string[]
};

const bootstrap = (
    state: MyStore['bootstrap'] = {
        user: {
            first_name: null,
            username: null,
            authenticated: false
        },
        isAuthenticated: null,
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
                isAuthenticated: action.payload.user.authenticated,
                isFetching: false
            };
        default:
            return state;
    }
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

const selectedRaster = (state: MyStore['selectedRaster'] = null, action: RasterSelected): MyStore['selectedRaster'] => {
    switch (action.type) {
        case RASTER_SELECTED:
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

const observationTypes = (state: MyStore['observationTypes'] = [], action: ObservationTypesFetched): MyStore['observationTypes'] => {
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
        default:
            return state;
    };
};

const organisations = (state: MyStore['organisations'] = [], action: OrganisationsFetched): MyStore['organisations'] => {
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
        default:
            return state;
    };
};

export const getCurrentRasterList = (state: MyStore) => {
    return state.currentRasterList;
};

export const getRaster = (state: MyStore, uuid: string) => {
    return state.allRasters[uuid];
};

export const getObservationTypes = (state: MyStore) => {
    return state.observationTypes;
};

export const getOrganisations = (state: MyStore) => {
    return state.organisations;
}

export default combineReducers({
    bootstrap,
    currentRasterList,
    allRasters,
    selectedRaster,
    basket,
    observationTypes,
    organisations,
});