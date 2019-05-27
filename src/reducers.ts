import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED } from "./action";
import { RastersFetched, RasterSelected, RastersObject, Raster } from './interface';

export interface MyStore {
    rastersObject: RastersObject | null;
    uuid: [];
    rasters: {};
    selectedRaster: Raster | null;
};

const rastersObject = (state: MyStore['rastersObject'] = null, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            return action.payload;
        default:
            return state;
    };
};

const uuid = (state: MyStore['uuid'] = [], action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            return action.payload.results.map(raster => raster.uuid);
        default:
            return state;
    }
};

const rasters = (state: MyStore['rasters'] = {}, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const newState = {}
            action.payload.results.forEach(raster => {
                newState[raster.uuid] = raster;
            });
            return newState;
        default:
            return state;
    }
}

const selectedRaster = (state: MyStore['selectedRaster'] = null, action: RasterSelected) => {
    switch (action.type) {
        case RASTER_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

export const getRastersObject = (state: MyStore) => {
    return state.rastersObject;
};

export const getRasters = (state: MyStore) => {
    return state.rasters;
}

export const getRaster = (state: MyStore) => {
    return state.selectedRaster;
};

export default combineReducers({
    rastersObject,
    uuid,
    rasters,
    selectedRaster
});