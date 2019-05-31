import request from 'superagent';
import { baseUrl } from './api';
import { RastersFetched, RasterSelected, RastersObject, Raster, ObservationType } from './interface';
import { Dispatch } from 'redux';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';

export const BASKET_ADDED = 'BASKET_ADDED';

const rastersFetched = (rasters: RastersObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasters
});

export const fetchRasters = (page: number, searchTerm: string, dispatch: Dispatch<RastersFetched>): void => {
    request
        .get(`${baseUrl}/rasters?name__icontains=${searchTerm}&page=${page}`)
        .then(response => {
            dispatch(rastersFetched(response.body))
        })
        .catch(console.error)
};

const rasterSelected = (raster: Raster): RasterSelected => ({
    type: RASTER_SELECTED,
    payload: raster
});

export const selectRaster = (raster: Raster, dispatch: Dispatch<RasterSelected>): void => {
    dispatch(rasterSelected(raster));
};

const basketAdded = (basket) => ({
    type: BASKET_ADDED,
    payload: basket
});

export const addToBasket = (basket, dispatch) => {
    dispatch(basketAdded(basket))
};

const observationTypesFetched = (observationTypes: ObservationType[]) => ({
    type: OBSERVATION_TYPES_FETCHED,
    payload: observationTypes
});

export const fetchObservationTypes = (dispatch) => {
    request
        .get(`${baseUrl}/observationtypes?page_size=0`)
        .then(response => {
            dispatch(observationTypesFetched(response.body))
        })
        .catch(console.error)
};

const organisationsFetched = (organisations) => ({
    type: ORGANISATIONS_FETCHED,
    payload: organisations
});

export const fetchOrganisations = (dispatch) => {
    request
        .get(`${baseUrl}/organisations?page_size=0`)
        .then(response => {
            dispatch(organisationsFetched(response.body))
        })
        .catch(console.error)
};