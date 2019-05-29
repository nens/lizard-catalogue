import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED, BASKET_ADDED } from "./action";
import { RastersFetched, RasterSelected, Raster, BasketAdded } from './interface';

export interface MyStore {
    rasterAPI: {
        count: number;
        previous: string | null;
        next: string | null;
        rasterList: string[];
    } | null;
    allRasters: {
        [index: string]: Raster;
    } | {};
    uuid: string | null;
    basket: string[];
};

const rasterAPI = (state: MyStore['rasterAPI'] = null, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const { count, previous, next } = action.payload;
            return {
                count: count,
                previous: previous,
                next: next,
                rasterList: action.payload.results.map(raster => raster.uuid)
            };
        default:
            return state;
    };
};

const allRasters = (state: MyStore['allRasters'] = {}, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const newState = {...state};
            action.payload.results.forEach(raster => {
                newState[raster.uuid] = raster;
            });
            return newState;
        default:
            return state;
    };
};

const uuid = (state: MyStore['uuid'] = null, action: RasterSelected) => {
    switch (action.type) {
        case RASTER_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

const basket = (state: MyStore['basket'] = [], action: BasketAdded) => {
    switch (action.type) {
        case BASKET_ADDED:
            return action.payload;
        default:
            return state;
    };
};

export const getRasterAPI = (state: MyStore) => {
    return state.rasterAPI;
};

export const getAllRasters = (state: MyStore) => {
    return state.allRasters;
}

export const getRasterUuid = (state: MyStore) => {
    return state.uuid;
};

export default combineReducers({
    rasterAPI,
    allRasters,
    uuid,
    basket
});