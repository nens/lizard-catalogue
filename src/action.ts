import request from 'superagent';
import { baseUrl } from './api';
import { RastersFetched, RasterSelected, APIObject, BasketAdded } from './interface';
import { Dispatch } from 'redux';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

export const BASKET_ADDED = 'BASKET_ADDED';

const rastersFetched = (apiObject: APIObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: apiObject
});

export const fetchRasters = (page: number, searchTerm: string, dispatch: Dispatch<RastersFetched>): void => {
    request
        .get(`${baseUrl}/rasters?name__icontains=${searchTerm}&page=${page}`)
        .then(response => {
            dispatch(rastersFetched(response.body))
        })
        .catch(console.error)
};

const rasterSelected = (uuid: string): RasterSelected => ({
    type: RASTER_SELECTED,
    payload: uuid
});

export const selectRaster = (uuid: string, dispatch: Dispatch<RasterSelected>): void => {
    dispatch(rasterSelected(uuid));
};

const basketAdded = (basket: string[]):BasketAdded => ({
    type: BASKET_ADDED,
    payload: basket
});

export const addToBasket = (basket: string[], dispatch: Dispatch<BasketAdded>): void => {
    dispatch(basketAdded(basket))
};