import request from 'superagent';
import { baseUrl } from './api';
import { Dispatch } from 'redux';
import {
    RastersFetched,
    RasterSelected,
    RasterListObject,
    BasketAdded,
    ObservationType,
    Organisation,
    Raster,
    ItemRemoved,
    ObservationTypesFetched,
    OrganisationsFetched,
    RastersRequested,
    RequestLizardBootstrap,
    ReceiveLizardBootstrap,
    WMSObject,
    RequestWMS,
    ReceiveWMS,
    SelectWMS
} from './interface';

//MARK: Bootsrap
export const REQUEST_LIZARD_BOOTSTRAP = "REQUEST_LIZARD_BOOTSTRAP";
export const RECEIVE_LIZARD_BOOTSTRAP = "RECEIVE_LIZARD_BOOTSTRAP";

const requestLizardBootsrap = (): RequestLizardBootstrap => ({
    type: REQUEST_LIZARD_BOOTSTRAP
});

const receiveLizardBootstrap = (data): ReceiveLizardBootstrap => ({
    type: RECEIVE_LIZARD_BOOTSTRAP,
    payload: data
});

export const fetchLizardBootstrap = (dispatch) => {
    dispatch(requestLizardBootsrap());
    fetch("/bootstrap/lizard/", {
        credentials: "same-origin"
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.user && data.user.authenticated === true) {
            dispatch(receiveLizardBootstrap(data));
        } 
    });
};

//MARK: Switch between rasters and wms layers
export const SWITCH_VIEW = 'SWITCH_VIEW';

const viewSwitched = () => ({
    type: SWITCH_VIEW
});

export const switchView = (dispatch): void => {
    dispatch(viewSwitched());
};

//MARK: Raster
export const RASTERS_REQUESTED = 'RASTERS_REQUESTED';
export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

const rastersRequested = (): RastersRequested => ({
    type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
});

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string, dispatch): void => {
    dispatch(rastersRequested());
    request
        .get(`${baseUrl}/rasters?name__icontains=${searchTerm}&page=${page}&organisation__name__icontains=${organisationName}&observation_type__parameter__icontains=${observationTypeParameter}&ordering=${ordering}`)
        .then(response => {
            if(response.body.count === 0) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                request
                    .get(`${baseUrl}/rasters?uuid=${searchTerm}&page=${page}&organisation__name__icontains=${organisationName}&observation_type__parameter__icontains=${observationTypeParameter}`)
                    .then(response => {
                        dispatch(rastersFetched(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(rastersFetched(response.body))
            }
        })
        .catch(console.error)
};

//Decide whether gonna use this fetch function
export const fetchRastersOnUuid = (searchUuid: string, dispatch: Dispatch<RastersFetched>): void => {
    request
        .get(`${baseUrl}/rasters?uuid=${searchUuid}`)
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

//MARK: WMS
export const REQUEST_WMS = 'REQUEST_WMS';
export const RECEIVE_WMS = 'RECEIVE_WMS';
export const SELECT_WMS = 'SELECT_WMS';

const wmsRequested = (): RequestWMS => ({
    type: REQUEST_WMS
});

const wmsReceived = (wmsObject: WMSObject): ReceiveWMS => ({
    type: RECEIVE_WMS,
    payload: wmsObject
});

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, ordering: string, dispatch): void => {
    dispatch(wmsRequested());
    request
        .get(`${baseUrl}/wmslayers?name__icontains=${searchTerm}&page=${page}&organisation__name__icontains=${organisationName}&ordering=${ordering}`)
        .then(response => {
            if(response.body.count === 0) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                request
                    .get(`${baseUrl}/wmslayers?uuid=${searchTerm}&page=${page}&organisation__name__icontains=${organisationName}&ordering=${ordering}`)
                    .then(response => {
                        dispatch(wmsReceived(response.body))
                    })
                    .catch(console.error)
            } else {
                dispatch(wmsReceived(response.body))
            }
        })
        .catch(console.error)
};

const wmsSelected = (uuid: string): SelectWMS => ({
    type: SELECT_WMS,
    payload: uuid
});

export const selectWMS = (uuid: string, dispatch): void => {
    dispatch(wmsSelected(uuid));
};

//MARK: Observation types and Organisation
export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';

const observationTypesFetched = (observationTypes: ObservationType[]): ObservationTypesFetched => ({
    type: OBSERVATION_TYPES_FETCHED,
    payload: observationTypes
});

export const fetchObservationTypes = (dispatch: Dispatch<ObservationTypesFetched>): void => {
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

export const fetchOrganisations = (dispatch: Dispatch<OrganisationsFetched>): void => {
    request
        .get(`${baseUrl}/organisations?page_size=0`)
        .then(response => {
            dispatch(organisationsFetched(response.body))
        })
        .catch(console.error)
};

//MARK: Basket
export const BASKET_UPDATED = 'BASKET_UPDATED';
export const ITEM_REMOVED = 'ITEM_REMOVED'

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