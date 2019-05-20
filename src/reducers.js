import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED } from "./action";

const rasters = (state = null, action) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            return action.payload;
        default:
            return state;
    };
};

const selectedRaster = (state = null, action) => {
    switch (action.type) {
        case RASTER_SELECTED:
            return action.payload;
        default:
            return state;
    };
};

export const getRasters = (state) => {
    return state.rasters
};

export const getRaster = (state) => {
    return state.selectedRaster
};

export default combineReducers({
    rasters,
    selectedRaster
});