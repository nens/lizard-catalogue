import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED } from "./action";
import { RastersFetched, RasterSelected, MyStore } from './interface';

const rasters = (state: MyStore['rasters'] = null, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            return action.payload;
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

export const getRasters = (state: MyStore) => {
    return state.rasters
};

export const getRaster = (state: MyStore) => {
    return state.selectedRaster
};

export default combineReducers({
    rasters,
    selectedRaster
});