import request from 'superagent';
import { baseUrl } from './api';
import { RastersFetched, RasterSelected, RasterListObject, BasketAdded, ObservationType, Organisation, Raster, ItemRemoved, ObservationTypesFetched, OrganisationsFetched } from './interface';
import { Dispatch } from 'redux';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';

export const BASKET_UPDATED = 'BASKET_UPDATED';
export const ITEM_REMOVED = 'ITEM_REMOVED'

const rastersFetched = (rasterListObject: RasterListObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
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

const basketUpdated = (basket: string[]): BasketAdded => ({
    type: BASKET_UPDATED,
    payload: basket
});

export const updateBasket = (basket: string[], dispatch: Dispatch<BasketAdded>): void => {
    dispatch(basketUpdated(basket))
};

const itemRemoved = (raster: Raster): ItemRemoved => ({
    type: ITEM_REMOVED,
    payload: raster.uuid
});

export const removeItem = (raster: Raster, dispatch: Dispatch<ItemRemoved>): void => {
    dispatch(itemRemoved(raster))
};

const observationTypesFetched = (observationTypes: ObservationType[]): ObservationTypesFetched => ({
    type: OBSERVATION_TYPES_FETCHED,
    payload: observationTypes
});

export const fetchObservationTypes = (dispatch: Dispatch<ObservationTypesFetched>) => {
    request
        .get(`${baseUrl}/observationtypes?page_size=0`)
        .then(response => {
            dispatch(observationTypesFetched(response.body))
        })
        .catch(console.error)
};

const organisationsFetched = (organisations: Organisation[]): OrganisationsFetched => ({
    type: ORGANISATIONS_FETCHED,
    payload: organisations
});

export const fetchOrganisations = (dispatch: Dispatch<OrganisationsFetched>, searchTerm: string) => {
    request
        .get(`${baseUrl}/organisations?name__icontains=${searchTerm}&page_size=0`)
        .then(response => {
            dispatch(organisationsFetched(response.body))
        })
        .catch(console.error)
};