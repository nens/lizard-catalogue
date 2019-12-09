import request from 'superagent';
import { baseUrl } from './api';
import { Dispatch,} from 'redux';
import store  from './store';
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
    ItemSelected,
    UpdateOrganisationRadiobutton,
    UpdateObservationTypeRadiobutton,
    UpdateDatasetRadiobutton,
    ToggleAlert,
    ExportGridCelId,
    RemoveFromSelectedExportGridCellIds,
    AddToSelectedExportGridCellIds,
    RemoveAllSelectedExportGridCellIds,
    RequestedGridCells,
    ExportGridCell,
    RetrievedRasterExportGridcells,
    FailedRetrievingRasterExportGridcells,
    SetRasterExportFormField,
    FieldValuePair,
    RemoveAllExportGridCells,
    RequestRasterExports,
    ReceivedTaskRasterExport,
    FailedTaskRasterExport,
    areGridCelIdsEqual,
} from './interface';
import { 
    getExportGridCellResolution, 
    getExportGridCellProjection, 
    getExportGridCellTileWidth, 
    getExportGridCellTileHeight, 
    getExportGridCellBounds, 
    getExportSelectedGridCellIds,
    getDateTimeStart,
} from './reducers';


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

const rastersRequested = (): RastersRequested => ({
    type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasterListObject
});

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(rastersRequested());
    const organisationParam = organisationName === '' ? '' : `&organisation__name__icontains=${organisationName}`;
    const observationTypeParam = observationTypeParameter === '' ? '' : `&observation_type__parameter__icontains=${observationTypeParameter}`;
    const datasetParam = datasetSlug === '' ? '' : `&datasets__slug=${datasetSlug}`;
    request
        .get(`${baseUrl}/rasters/?name__icontains=${searchTerm}&page=${page}${organisationParam}${observationTypeParam}${datasetParam}&ordering=${ordering}&scenario__isnull=true`)
        .then(response => {
            if(response.body.count === 0) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                request
                    .get(`${baseUrl}/rasters/?uuid=${searchTerm}&page=${page}${organisationParam}${observationTypeParam}${datasetParam}&scenario__isnull=true`)
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
        .get(`${baseUrl}/rasters/?uuid=${searchUuid}`)
        .then(response => {
            dispatch(rastersFetched(response.body))
        })
        .catch(console.error)
};

//MARK: WMS
export const REQUEST_WMS = 'REQUEST_WMS';
export const RECEIVE_WMS = 'RECEIVE_WMS';

const wmsRequested = (): RequestWMS => ({
    type: REQUEST_WMS
});

const wmsReceived = (wmsObject: WMSObject): ReceiveWMS => ({
    type: RECEIVE_WMS,
    payload: wmsObject
});

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string, dispatch): void => {
    dispatch(wmsRequested());
    const organisationParam = organisationName === '' ? '' : `&organisation__name__icontains=${organisationName}`;
    const datasetParam = datasetSlug === '' ? '' : `&datasets__slug=${datasetSlug}`;
    request
        .get(`${baseUrl}/wmslayers/?name__icontains=${searchTerm}&page=${page}${organisationParam}${datasetParam}&ordering=${ordering}`)
        .then(response => {
            if(response.body.count === 0) {
                //If could not find any raster with the search term by raster's name then look for raster's uuid
                request
                    .get(`${baseUrl}/wmslayers/?uuid=${searchTerm}&page=${page}${organisationParam}${datasetParam}&ordering=${ordering}`)
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

//MARK: Select Item to view (Raster or WMS layer)
export const ITEM_SELECTED = 'ITEM_SELECTED';

const itemSelected = (uuid: string): ItemSelected => ({
    type: ITEM_SELECTED,
    payload: uuid
});

export const selectItem = (uuid: string, dispatch): void => {
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

export const fetchObservationTypes = (parameter: ObservationType['parameter'], dispatch: Dispatch<ObservationTypesFetched | UpdateObservationTypeRadiobutton>): void => {
    request
        .get(`${baseUrl}/observationtypes/?page_size=0`)
        .then(response => {
            dispatch(observationTypesFetched(response.body));
            if (parameter && parameter !== '') updateObservationTypeRadiobutton(parameter, dispatch);
        })
        .catch(console.error)
};

const organisationsFetched = (organisations: Organisation[]): OrganisationsFetched => ({
    type: ORGANISATIONS_FETCHED,
    payload: organisations
});

export const fetchOrganisations = (name: Organisation['name'], dispatch: Dispatch<OrganisationsFetched | UpdateOrganisationRadiobutton>): void => {
    request
        .get(`${baseUrl}/organisations/?page_size=0`)
        .then(response => {
            dispatch(organisationsFetched(response.body));
            if (name && name !== '') updateOrganisationRadiobutton(name, dispatch);
        })
        .catch(console.error)
};

const datasetsFetched = (datasets: Dataset[]): DatasetsFetched => ({
    type: DATASETS_FETCHED,
    payload: datasets
});

export const fetchDatasets = (slug: Dataset['slug'], dispatch: Dispatch<DatasetsFetched | UpdateDatasetRadiobutton>): void => {
    request
        .get(`${baseUrl}/datasets/?page_size=0`)
        .then(response => {
            dispatch(datasetsFetched(response.body));
            if (slug && slug !== '') updateDatasetRadiobutton(slug, dispatch);
        })
        .catch(console.error)
};
export const UPDATE_ORGANISATION_RADIOBUTTON = 'UPDATE_ORGANISATION_RADIOBUTTON';
export const UPDATE_OBSERVATION_RADIOBUTTON = 'UPDATE_OBSERVATION_RADIOBUTTON';
export const UPDATE_DATASET_RADIOBUTTON = 'UPDATE_DATASET_RADIOBUTTON';

const organisationRadiobuttonUpdated = (name: Organisation['name']): UpdateOrganisationRadiobutton => ({
    type: UPDATE_ORGANISATION_RADIOBUTTON,
    payload: name
});

export const updateOrganisationRadiobutton = (name: Organisation['name'], dispatch: Dispatch<UpdateOrganisationRadiobutton>) => {
    dispatch(organisationRadiobuttonUpdated(name));
};

const observationTypeRadiobuttonUpdated = (parameter: ObservationType['parameter']): UpdateObservationTypeRadiobutton => ({
    type: UPDATE_OBSERVATION_RADIOBUTTON,
    payload: parameter
});

export const updateObservationTypeRadiobutton = (parameter: ObservationType['parameter'], dispatch: Dispatch<UpdateObservationTypeRadiobutton>) => {
    dispatch(observationTypeRadiobuttonUpdated(parameter));
};

const datasetRadiobuttonUpdated = (slug: Dataset['slug']): UpdateDatasetRadiobutton => ({
    type: UPDATE_DATASET_RADIOBUTTON,
    payload: slug
});

export const updateDatasetRadiobutton = (slug: Dataset['slug'], dispatch: Dispatch<UpdateDatasetRadiobutton>) => {
    dispatch(datasetRadiobuttonUpdated(slug));
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

//MARK: Request inbox messages
export const REQUEST_INBOX = 'REQUEST_INBOX';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
export const DOWNLOAD_FILE = 'DOWNLOAD_FILE';

export const requestInbox = (dispatch) => {
    setInterval(() => {
        request
            .get(`/api/v3/inbox/`)
            .then(response => {
                dispatch({
                    type: REQUEST_INBOX,
                    messages: response.body.results
                });
            })
            .catch(console.error)
    }, 5000);
};

export const removeMessage = (dispatch, id: string) => {
    dispatch({
        type: REMOVE_MESSAGE,
        id
    });
};

export const downloadFile = (dispatch, id: string) => {
    dispatch({
        type: DOWNLOAD_FILE,
        id
    });
};


export const ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS = 'ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS';
export const REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS = 'REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS';
export const REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS = 'REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS';
export const REQUESTED_RASTER_EXPORT_GRIDCELLS = 'REQUESTED_RASTER_EXPORT_GRIDCELLS';
export const RETRIEVED_RASTER_EXPORT_GRIDCELLS = 'RETRIEVED_RASTER_EXPORT_GRIDCELLS';
export const FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS = 'FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS';
export const SET_RASTER_EXPORT_RESOLUTION = 'SET_RASTER_EXPORT_RESOLUTION';
export const SET_RASTER_EXPORT_FORM_FIELD = 'SET_RASTER_EXPORT_FORM_FIELD';
export const REMOVE_ALL_EXPORT_GRID_CELLS = 'REMOVE_ALL_EXPORT_GRID_CELLS';
export const REQUEST_RASTER_EXPORTS = "REQUEST_RASTER_EXPORTS";
export const RECEIVED_TASK_RASTER_EXPORT = "RECEIVED_TASKS_RASTER_EXPORTS";
export const FAILED_TASK_RASTER_EXPORT = "FAILED_TASK_RASTER_EXPORT";

export const removeFromSelectedExportGridCellIds = (gridCellIds: ExportGridCelId[]): RemoveFromSelectedExportGridCellIds => ({
    type: REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const addToSelectedExportGridCellIds = (gridCellIds: ExportGridCelId[]): AddToSelectedExportGridCellIds => ({
    type: ADD_TO_SELECTED_EXPORT_GRID_CELL_IDS,
    gridCellIds,
});
export const removeAllSelectedExportGridCellIds = (): RemoveAllSelectedExportGridCellIds => ({
    type: REMOVE_ALL_SELECTED_EXPORT_GRID_CELL_IDS,
});
export const removeAllExportGridCells = (): RemoveAllExportGridCells => ({
    type: REMOVE_ALL_EXPORT_GRID_CELLS,
});


export const requestedGridCells = (): RequestedGridCells => ({
    type: REQUESTED_RASTER_EXPORT_GRIDCELLS
});
export const retrievedGridCells = (gridCells: ExportGridCell[]): RetrievedRasterExportGridcells => ({
    type: RETRIEVED_RASTER_EXPORT_GRIDCELLS,
    gridCells: gridCells,
});
export const failedRetrievingRasterExportGridcells = (msg: string): FailedRetrievingRasterExportGridcells=> ({
    type: FAILED_RETRIEVING_RASTER_EXPORT_GRIDCELLS,
    failedMsg: msg,
});

export const updateExportRasterFormField = (fieldValuePair:FieldValuePair): SetRasterExportFormField => ({
    type: SET_RASTER_EXPORT_FORM_FIELD,
    fieldValuePair,
});

export const setCurrentRasterExportsToStore = (): RequestRasterExports => ({
    type: REQUEST_RASTER_EXPORTS,
})

export const receivedTaskRasterExport = (id: ExportGridCelId): ReceivedTaskRasterExport => ({
    type: RECEIVED_TASK_RASTER_EXPORT,
    id: id,
})

export const failedTaskRasterExport = (id: ExportGridCelId): FailedTaskRasterExport => ({
    type: FAILED_TASK_RASTER_EXPORT,
    id: id,
})

const fieldValuePairContainsFieldThatShouldResetGridCells = (fieldValuePair: FieldValuePair) => {
     return   fieldValuePair.field === 'projection' ||
        fieldValuePair.field === 'resolution' ||
        fieldValuePair.field === 'tileWidth' ||
        fieldValuePair.field === 'tileHeight'
}
const fieldValuePairsListContainsFieldThatShouldResetGridCells = (fieldValuePairs: FieldValuePair[]) => {
    return   !!fieldValuePairs.find(fieldValuePairContainsFieldThatShouldResetGridCells);
}

export const updateExportFormAndFetchExportGridCells = (
    fieldValuePairesToUpdate: FieldValuePair[], 
    dispatch
): void => {

    if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
        dispatch(removeAllSelectedExportGridCellIds());
        dispatch(removeAllExportGridCells());
    }
    fieldValuePairesToUpdate.forEach((fieldValuePair)=>{
        dispatch(updateExportRasterFormField(fieldValuePair));
    });
    dispatch(requestedGridCells());

    const state = store.getState();
    const resolution = getExportGridCellResolution(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const rasterUuid = state.selectedItem;
    const bounds = getExportGridCellBounds(state);
    const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
    
    request
        .get(`${baseUrl}/rasters/${rasterUuid}/grid/?projection=${projection}&cell_size=${resolution}&tile_height=${tileHeight}&tile_width=${tileWidth}&bbox=${boundsString}`)
        .then(response => {
            const gridCells = response.body.features;

            const newState = store.getState();
            const newResolution = getExportGridCellResolution(newState);
            const newProjection = getExportGridCellProjection(newState);
            const newTileWidth = getExportGridCellTileWidth(newState);
            const newTileHeight = getExportGridCellTileHeight(newState);
            const newRasterUuid = newState.selectedItem;

            if (
                // only update the gridcells if the values for which the request was done were not changed
                newResolution === resolution &&
                newProjection === projection &&
                newTileWidth === tileWidth &&
                newTileHeight === tileHeight &&
                newRasterUuid === rasterUuid
            ) {
                if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
                    dispatch(removeAllSelectedExportGridCellIds());
                    dispatch(removeAllExportGridCells());
                }
                dispatch(retrievedGridCells(gridCells));
            }

            
        })
        .catch(error=>{
            console.error(error);
            dispatch(failedRetrievingRasterExportGridcells(error+''));
        })
};


export const requestRasterExports = (
    dispatch
): void => {

    dispatch(setCurrentRasterExportsToStore());

    const state = store.getState();
    const selectedGridCellIds = getExportSelectedGridCellIds(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const start = getDateTimeStart(state);
    const rasterUuid = state.selectedItem;
    const availableGridCells = state.rasterExportState.availableGridCells;

    selectedGridCellIds.forEach((id)=>{

        const currentGrid = availableGridCells.find(cell=>{return areGridCelIdsEqual(cell.properties.id, id)});
        if (!currentGrid) {
            console.warn(`Raster with id ${id} not found among availableGridCells. Therefore export was not started.`);
            // TODO how do we recover from this ?
            return;
        }
        const currentGridBbox = currentGrid.properties.bbox;
        const requestUrl = start===''?
            `${baseUrl}/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&async=true&notify_user=true`
            :
            `${baseUrl}/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&start=${start}&async=true&notify_user=true`

        request.get(requestUrl)
        .then(response => {
            console.log('raster grid cell export task returns, response: ', response, id);
            dispatch(receivedTaskRasterExport(id));
        })
        .catch(error=>{
            console.error(error);
            dispatch(failedTaskRasterExport(id));
        })

    });
    
};