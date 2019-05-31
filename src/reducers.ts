import { combineReducers } from 'redux';
import { RASTERS_FETCHED, RASTER_SELECTED, BASKET_ADDED, OBSERVATION_TYPES_FETCHED, ORGANISATIONS_FETCHED } from "./action";
import { RastersFetched, RasterSelected, RastersObject, Raster, ObservationType, Organisation } from './interface';

export interface MyStore {
    rastersObject: RastersObject | null;
    observationTypes: ObservationType[] | null;
    organisations: Organisation[] | null;
    uuid: [];
    rasters: {};
    selectedRaster: Raster | null;
    basket: {};
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
    };
};

const rasters = (state: MyStore['rasters'] = {}, action: RastersFetched) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            const newState = {};
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

const basket = (state: MyStore['basket'] = {}, action) => {
    switch (action.type) {
        case BASKET_ADDED:
            return action.payload;
        default:
            return state;
    };
};

const observationTypes = (state: MyStore['observationTypes'] = null, action) => {
    switch (action.type) {
        case OBSERVATION_TYPES_FETCHED:
            return action.payload;
        default:
            return state;
    };
};

const organisations = (state: MyStore['organisations'] = null, action) => {
    switch (action.type) {
        case ORGANISATIONS_FETCHED:
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
};

export const getRaster = (state: MyStore) => {
    return state.selectedRaster;
};

export const getObservationTypes = (state: MyStore) => {
    return state.observationTypes;
};

export const getOrganisations = (state: MyStore) => {
    return state.organisations;
}

export default combineReducers({
    rastersObject,
    observationTypes,
    organisations,
    uuid,
    rasters,
    selectedRaster,
    basket,
});