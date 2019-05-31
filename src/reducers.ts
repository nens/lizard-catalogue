import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED, BASKET_UPDATED } from "./action";
import { RastersFetched, RasterSelected, Raster, BasketAdded } from './interface';

export interface MyStore {
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

const currentRasterList = (state: MyStore['currentRasterList'] = null, action: RastersFetched) => {
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

const selectedRaster = (state: MyStore['selectedRaster'] = null, action: RasterSelected) => {
    switch (action.type) {
        case RASTER_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

const basket = (state: MyStore['basket'] = [], action: BasketAdded) => {
    switch (action.type) {
        case BASKET_UPDATED:
            return action.payload;
        default:
            return state;
    };
};

export const getCurrentRasterList = (state: MyStore) => {
    return state.currentRasterList;
};

export const getAllRasters = (state: MyStore) => {
    return state.allRasters;
}

export const getRaster = (state: MyStore) => {
    return state.selectedRaster;
};

export default combineReducers({
    currentRasterList,
    allRasters,
    selectedRaster,
    basket
});