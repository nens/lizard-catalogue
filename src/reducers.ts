import { combineReducers } from 'redux';
import {
    RASTERS_FETCHED,
    RASTER_SELECTED,
    BASKET_UPDATED,
    OBSERVATION_TYPES_FETCHED,
    ORGANISATIONS_FETCHED,
    ITEM_REMOVED,
    RASTERS_SORTED
} from "./action";
import {
    RastersFetched,
    RasterSelected,
    Raster,
    ObservationType,
    Organisation,
    Basket,
    OrganisationsFetched,
    ObservationTypesFetched,
    RastersSorted
} from './interface';

export interface MyStore {
    observationTypes: ObservationType[];
    organisations: Organisation[];
    currentRasterList: {
        count: number;
        previous: string | null;
        next: string | null;
        rasterList: string[];
    } | null;
    allRasters: {
        [index: string]: Raster;
    } | {};
    selectedRaster: string | null;
    basket: string[];
};

const currentRasterList = (state: MyStore['currentRasterList'] = null, action: RastersFetched | RastersSorted) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                rasterList: action.payload.results.map(raster => raster.uuid)
            };
        case RASTERS_SORTED:
            const newState = { ...state }
            return {
                ...newState,
                rasterList: action.payload
            };
        default:
            return state;
    };
};

const allRasters = (state: MyStore['allRasters'] = {}, action: RastersFetched) => {
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

const selectedRaster = (state: MyStore['selectedRaster'] = null, action: RasterSelected) => {
    switch (action.type) {
        case RASTER_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

const basket = (state: MyStore['basket'] = [], action: Basket) => {
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

const observationTypes = (state: MyStore['observationTypes'] = [], action: ObservationTypesFetched) => {
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

const organisations = (state: MyStore['organisations'] = [], action: OrganisationsFetched) => {
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
    currentRasterList,
    allRasters,
    selectedRaster,
    basket,
    observationTypes,
    organisations,
});