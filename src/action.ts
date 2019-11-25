import request from 'superagent';
import { baseUrl } from './api';
import { Dispatch } from 'redux';
import {
    RastersFetched,
    RasterListObject,
    ObservationType,
    Organisation,
    Dataset,
    ObservationTypesFetched,
    OrganisationsFetched,
    DatasetsFetched,
    RastersRequested,
    RequestLizardBootstrap,
    ReceiveLizardBootstrap,
    WMSObject,
    RequestWMS,
    ReceiveWMS,
    SwitchDataType,
    ToggleAlert,
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
export const SWITCH_DATA_TYPE = 'SWITCH_DATA_TYPE';

const dataTypeSwitched = (dataType: SwitchDataType['payload']): SwitchDataType => ({
    type: SWITCH_DATA_TYPE,
    payload: dataType
});

export const switchDataType = (dataType: SwitchDataType['payload'], dispatch): void => {
    dispatch(dataTypeSwitched(dataType));
};

//MARK: Raster
export const RASTERS_REQUESTED = 'RASTERS_REQUESTED';
export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_FETCHED = 'RASTER_FETCHED';

const rastersRequested = (): RastersRequested => ({
    type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
});

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(rastersRequested());
    const searchParam = !searchTerm ? '' : `name__icontains=${searchTerm}`;
    const organisationParam = !organisationName ? '' : `&organisation__name__icontains=${organisationName}`;
    const observationTypeParam = !observationTypeParameter ? '' : `&observation_type__parameter__icontains=${observationTypeParameter}`;
    const datasetParam = !datasetSlug ? '' : `&datasets__slug=${datasetSlug}`;
    const orderingParam = !ordering ? '' : `&ordering=${ordering}`;
    request
        .get(`${baseUrl}/rasters/?${searchParam}&page=${page}${organisationParam}${observationTypeParam}${datasetParam}${orderingParam}&scenario__isnull=true`)
        .then(response => {
            if(response.body.count === 0 && searchTerm) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                request
                    .get(`${baseUrl}/rasters/?uuid=${searchTerm ? searchTerm : ''}&page=${page}${organisationParam}${observationTypeParam}${datasetParam}&scenario__isnull=true`)
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

export const fetchRasterByUUID = (uuid: string, dispatch) => {
    request
        .get(`${baseUrl}/rasters/${uuid}`)
        .then(response => {
            dispatch({
                type: RASTER_FETCHED,
                raster: response.body
            });
        });
};

//Decide whether gonna use this fetch function
export const fetchRastersOnUuid = (searchUuid: string, dispatch: Dispatch<RastersFetched>): void => {
    request
        .get(`${baseUrl}/rasters/?uuid=${searchUuid}`)
        .then(response => {
            dispatch(rastersFetched(response.body))
        })
        .catch(console.error)
};

//MARK: WMS
export const REQUEST_WMS = 'REQUEST_WMS';
export const RECEIVE_WMS = 'RECEIVE_WMS_LAYERS';
export const RECEIVE_WMS_LAYER = 'RECEIVE_WMS_LAYER';

const wmsRequested = (): RequestWMS => ({
    type: REQUEST_WMS
});

const wmsReceived = (wmsObject: WMSObject): ReceiveWMS => ({
    type: RECEIVE_WMS,
    payload: wmsObject
});

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(wmsRequested());
    const searchParam = !searchTerm ? '' : `name__icontains=${searchTerm}`;
    const organisationParam = !organisationName ? '' : `&organisation__name__icontains=${organisationName}`;
    const datasetParam = !datasetSlug ? '' : `&datasets__slug=${datasetSlug}`;
    const orderingParam = !ordering ? '' : `&ordering=${ordering}`;
    request
        .get(`${baseUrl}/wmslayers/?${searchParam}&page=${page}${organisationParam}${datasetParam}${orderingParam}`)
        .then(response => {
            if(response.body.count === 0 && searchTerm) {
                //If could not find any WMS layer with the search term by WMS's name then look for WMS's uuid
                request
                    .get(`${baseUrl}/wmslayers/?uuid=${searchTerm ? searchTerm : ''}&page=${page}${organisationParam}${datasetParam}`)
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

export const fetchWMSByUUID = (uuid: string, dispatch) => {
    request
        .get(`${baseUrl}/wmslayers/${uuid}`)
        .then(response => {
            dispatch({
                type: RECEIVE_WMS_LAYER,
                wms: response.body
            });
        });
};

//MARK: Select Item to view (Raster or WMS layer)
export const ITEM_SELECTED = 'ITEM_SELECTED';

const itemSelected = (uuid: string | null) => ({
    type: ITEM_SELECTED,
    payload: uuid
});

export const selectItem = (uuid: string | null, dispatch): void => {
    dispatch(itemSelected(uuid));
};

//MARK: Observation types and Organisation
export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';
export const DATASETS_FETCHED = 'DATASETS_FETCHED';

const observationTypesFetched = (observationTypes: ObservationType[]): ObservationTypesFetched => ({
    type: OBSERVATION_TYPES_FETCHED,
    payload: observationTypes
});

export const fetchObservationTypes = (dispatch): void => {
    request
        .get(`${baseUrl}/observationtypes/?page_size=0`)
        .then(response => {
            dispatch(observationTypesFetched(response.body));
        })
        .catch(console.error)
};

const organisationsFetched = (organisations: Organisation[]): OrganisationsFetched => ({
    type: ORGANISATIONS_FETCHED,
    payload: organisations
});

export const fetchOrganisations = (dispatch): void => {
    request
        .get(`${baseUrl}/organisations/?page_size=0`)
        .then(response => {
            dispatch(organisationsFetched(response.body));
        })
        .catch(console.error)
};

const datasetsFetched = (datasets: Dataset[]): DatasetsFetched => ({
    type: DATASETS_FETCHED,
    payload: datasets
});

export const fetchDatasets = (dispatch): void => {
    request
        .get(`${baseUrl}/datasets/?page_size=0`)
        .then(response => {
            dispatch(datasetsFetched(response.body));
        })
        .catch(console.error)
};

//MARK: Filters
export const SELECT_ORGANISATION = 'SELECT_ORGANISATION';
export const SELECT_DATASET = 'SELECT_DATASET';
export const SELECT_OBSERVATIONTYPE = 'SELECT_OBSERVATIONTYPE';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const REMOVE_ORGANISATION = 'REMOVE_ORGANISATION';
export const REMOVE_DATASET = 'REMOVE_DATASET';
export const REMOVE_OBSERVATIONTYPE = 'REMOVE_OBSERVATIONTYPE';
export const REMOVE_SEARCH = 'REMOVE_SEARCH';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const UPDATE_PAGE = 'UPDATE_PAGE';

export const selectOrganisation = (dispatch, organisation: string) => {
    dispatch({
        type: SELECT_ORGANISATION,
        organisation
    });
};

export const removeOrganisation = (dispatch) => {
    dispatch({
        type: REMOVE_ORGANISATION
    });
};

export const selectDataset = (dispatch, dataset: string) => {
    dispatch({
        type: SELECT_DATASET,
        dataset
    });
};

export const removeDataset = (dispatch) => {
    dispatch({
        type: REMOVE_DATASET
    });
};

export const selectObservationType = (dispatch, observationType: string) => {
    dispatch({
        type: SELECT_OBSERVATIONTYPE,
        observationType
    });
};

export const removeObservationType = (dispatch) => {
    dispatch({
        type: REMOVE_OBSERVATIONTYPE
    });
};

export const updateSearch = (dispatch, searchTerm: string) => {
    dispatch({
        type: UPDATE_SEARCH,
        searchTerm
    });
};

export const removeSearch = (dispatch) => {
    dispatch({
        type: REMOVE_SEARCH
    });
};

export const updateOrder = (dispatch, ordering: string) => {
    dispatch({
        type: UPDATE_ORDER,
        ordering
    });
};

export const updatePage = (dispatch, page: number) => {
    dispatch({
        type: UPDATE_PAGE,
        page
    });
};


//MARK: Basket
export const UPDATE_BASKET_WITH_RASTER = 'UPDATE_BASKET_WITH_RASTER';
export const REMOVE_RASTER_FROM_BASKET = 'REMOVE_RASTER_FROM_BASKET';
export const UPDATE_BASKET_WITH_WMS = 'UPDATE_BASKET_WITH_WMS';
export const REMOVE_WMS_FROM_BASKET = 'REMOVE_WMS_FROM_BASKET';

export const updateBasketWithRaster = (rasters: string[], dispatch): void => {
    dispatch({
        type: UPDATE_BASKET_WITH_RASTER,
        rasters
    });
};

export const removeRasterFromBasket = (uuid: string, dispatch): void => {
    dispatch({
        type: REMOVE_RASTER_FROM_BASKET,
        uuid
    });
};

export const updateBasketWithWMS = (wmsLayers: string[], dispatch): void => {
    dispatch({
        type: UPDATE_BASKET_WITH_WMS,
        wmsLayers
    });
};

export const removeWMSFromBasket = (uuid: string, dispatch): void => {
    dispatch({
        type: REMOVE_WMS_FROM_BASKET,
        uuid
    });
};

//MARK: Toggle the showAlert
export const TOGGLE_ALERT = 'TOGGLE_ALERT';

const alertToggled = (): ToggleAlert => ({
    type: TOGGLE_ALERT
});

export const toggleAlert = (dispatch: Dispatch<ToggleAlert>) => {
    dispatch(alertToggled());
};