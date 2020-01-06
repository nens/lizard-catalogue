import request from 'superagent';
import { RootDispatch }  from './store';

import {
    RasterListObject,
    WMSObject,
    SwitchDataType,
    ExportGridCellId,
    RemoveFromSelectedExportGridCellIds,
    AddToSelectedExportGridCellIds,
    RemoveAllSelectedExportGridCellIds,
    RequestedGridCells,
    ExportGridCell,
    RetrievedRasterExportGridcells,
    FailedRetrievingRasterExportGridcells,
    FieldValuePair,
    RemoveAllExportGridCells,
    RequestRasterExports,
    ReceivedTaskRasterExport,
    FailedTaskRasterExport,
    ReceivedProjections,
    Projection,
    FetchingState,
    SetFetchingStateProjections,
  SetRasterExportFormFields,
  Raster,
  WMS,
  ObservationType,
  Organisation,
  Dataset,
  Message
} from './interface';
import {
  MyStore,
    getExportGridCellResolution,
    getExportGridCellProjection,
    getExportGridCellTileWidth,
    getExportGridCellTileHeight,
    getExportGridCellBounds,
    getExportSelectedGridCellIds,
    getDateTimeStart,
} from './reducers';
import {areGridCelIdsEqual} from './utils/rasterExportUtils'

//MARK: Bootsrap
export const REQUEST_LIZARD_BOOTSTRAP = "REQUEST_LIZARD_BOOTSTRAP";
export const RECEIVE_LIZARD_BOOTSTRAP = "RECEIVE_LIZARD_BOOTSTRAP";

export interface RequestLizardBootstrap {
  type: typeof REQUEST_LIZARD_BOOTSTRAP
}

export interface ReceiveLizardBootstrap {
  type: typeof RECEIVE_LIZARD_BOOTSTRAP,
  payload: any
}

export type BootstrapAction = RequestLizardBootstrap | ReceiveLizardBootstrap;

export const fetchLizardBootstrap = (dispatch: RootDispatch) => {
  dispatch({
    type: REQUEST_LIZARD_BOOTSTRAP
  });
  fetch("/bootstrap/lizard/", {
    credentials: "same-origin"
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.user && data.user.authenticated === true) {
        dispatch({
          type: RECEIVE_LIZARD_BOOTSTRAP,
          payload: data
        });
      }
    });
};

//MARK: Switch between rasters and wms layers
export const SWITCH_DATA_TYPE = 'SWITCH_DATA_TYPE';

export const switchDataType = (dataType: SwitchDataType['payload'], dispatch: RootDispatch): void => {
  dispatch({
    type: SWITCH_DATA_TYPE,
    payload: dataType
  });
};

//MARK: Raster
export const RASTERS_REQUESTED = 'RASTERS_REQUESTED';
export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_FETCHED = 'RASTER_FETCHED';

export interface RastersRequested {
  type: typeof RASTERS_REQUESTED
}

export interface RastersFetched {
  type: typeof RASTERS_FETCHED,
  payload: RasterListObject
}

export interface RasterFetched {
  type: typeof RASTER_FETCHED,
  raster: Raster
}

const rastersRequested = (): RastersRequested => ({
  type: RASTERS_REQUESTED
});

const rastersFetched = (rasterListObject: RasterListObject): RastersFetched => ({
  type: RASTERS_FETCHED,
  payload: rasterListObject
});

export const fetchRasters = (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string, dispatch: RootDispatch): void => {
  dispatch(rastersRequested());

  const params: string[] = [];

  if (page) params.push(`page=${page}`);
  if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
  if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
  if (datasetSlug) params.push(`datasets__slug=${encodeURIComponent(datasetSlug)}`);
  if (observationTypeParameter) params.push(`observation_type__parameter__icontains=${encodeURIComponent(observationTypeParameter)}`);
  if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

  const queries = params.join('&');

  request
    .get(`/api/v4/rasters/?${queries}&scenario__isnull=true`)
    .then(response => {
      if(response.body.count === 0 && searchTerm) {
        //If could not find any raster with the search term by raster's name then look for raster's uuid
        const newQueries = queries.replace('name__icontains', 'uuid');
        request
          .get(`/api/v4/rasters/?${newQueries}&scenario__isnull=true`)
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

export const fetchRasterByUUID = (uuid: string, dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/rasters/${uuid}`)
    .then(response => {
      dispatch({
        type: RASTER_FETCHED,
        raster: response.body
      });
    })
    .catch(console.error)
};

//Decide whether gonna use this fetch function
export const fetchRastersOnUuid = (searchUuid: string, dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/rasters/?uuid=${searchUuid}`)
    .then(response => {
      dispatch(rastersFetched(response.body))
    })
    .catch(console.error)
};

//MARK: WMS
export const REQUEST_WMS = 'REQUEST_WMS';
export const RECEIVE_WMS_LAYERS = 'RECEIVE_WMS_LAYERS';
export const RECEIVE_WMS_LAYER = 'RECEIVE_WMS_LAYER';

export interface RequestWms {
  type: typeof REQUEST_WMS
}

export interface ReceiveWmsLayers {
  type: typeof RECEIVE_WMS_LAYERS,
  payload: WMSObject
}

export interface ReceiveWmsLayer {
  type: typeof RECEIVE_WMS_LAYER,
  wms: WMS
}

const wmsRequested = () => ({
  type: REQUEST_WMS
});

const wmsLayersReceived = (wmsObject: WMSObject) => ({
  type: RECEIVE_WMS_LAYERS,
  payload: wmsObject
});

export const fetchWMSLayers = (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string, dispatch: RootDispatch): void => {
  dispatch(wmsRequested());

  const params: string[] = [];

  if (page) params.push(`page=${page}`);
  if (searchTerm) params.push(`name__icontains=${encodeURIComponent(searchTerm)}`);
  if (organisationName) params.push(`organisation__name__icontains=${encodeURIComponent(organisationName)}`);
  if (datasetSlug) params.push(`datasets__slug=${encodeURIComponent(datasetSlug)}`);
  if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);

  const queries = params.join('&');

  request
    .get(`/api/v4/wmslayers/?${queries}`)
    .then(response => {
      if(response.body.count === 0 && searchTerm) {
        //If could not find any WMS layer with the search term by WMS's name then look for WMS's uuid
        const newQueries = queries.replace('name__icontains', 'uuid');
        request
          .get(`/api/v4/wmslayers/?${newQueries}`)
          .then(response => {
            dispatch(wmsLayersReceived(response.body))
          })
          .catch(console.error)
      } else {
        dispatch(wmsLayersReceived(response.body))
      }
    })
    .catch(console.error)
};

export const fetchWMSByUUID = (uuid: string, dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/wmslayers/${uuid}`)
    .then(response => {
      dispatch({
        type: RECEIVE_WMS_LAYER,
        wms: response.body
      });
    })
    .catch(console.error)
};

//MARK: Select Item to view (Raster or WMS layer)
export const ITEM_SELECTED = 'ITEM_SELECTED';

export interface ItemSelected {
  type: typeof ITEM_SELECTED,
  uuid: string
}

export const selectItem = (uuid: string, dispatch: RootDispatch): void => {
  dispatch({
    type: ITEM_SELECTED,
    uuid
  });
};

//MARK: Observation types and Organisation
export const OBSERVATION_TYPES_FETCHED = 'OBSERVATION_TYPES_FETCHED';
export const ORGANISATIONS_FETCHED = 'ORGANISATIONS_FETCHED';
export const DATASETS_FETCHED = 'DATASETS_FETCHED';

export interface ObservationTypesFetched {
  type: typeof OBSERVATION_TYPES_FETCHED,
  observationTypes: ObservationType[]
}

export interface OrganisationsFetched {
  type: typeof ORGANISATIONS_FETCHED,
  organisations: Organisation[]
}

export interface DatasetsFetched {
  type: typeof DATASETS_FETCHED,
  datasets: Dataset[]
}

export const fetchObservationTypes = (dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/observationtypes/?page_size=0`)
    .then(response => {
      dispatch({
        type: OBSERVATION_TYPES_FETCHED,
        observationTypes: response.body
      });
    })
    .catch(console.error)
};

export const fetchOrganisations = (dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/organisations/?page_size=0`)
    .then(response => {
      dispatch({
        type: ORGANISATIONS_FETCHED,
        organisations: response.body
      });
    })
    .catch(console.error)
};

export const fetchDatasets = (dispatch: RootDispatch): void => {
  request
    .get(`/api/v4/datasets/?page_size=0`)
    .then(response => {
      dispatch({
        type: DATASETS_FETCHED,
        datasets: response.body
      });
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

export interface SelectOrganisation {
  type: typeof SELECT_ORGANISATION,
  organisation: string
}

export const selectOrganisation = (dispatch: RootDispatch, organisation: string) => {
  dispatch({
    type: SELECT_ORGANISATION,
    organisation
  });
};

export interface RemoveOrganisation {
  type: typeof REMOVE_ORGANISATION
}

export const removeOrganisation = (dispatch: RootDispatch) => {
  dispatch({
    type: REMOVE_ORGANISATION
  });
};

export interface SelectDataset {
  type: typeof SELECT_DATASET,
  dataset: string
}

export const selectDataset = (dispatch: RootDispatch, dataset: string) => {
  dispatch({
    type: SELECT_DATASET,
    dataset
  });
};

export interface RemoveDataset {
  type: typeof REMOVE_DATASET
}

export const removeDataset = (dispatch: RootDispatch) => {
  dispatch({
    type: REMOVE_DATASET
  });
};

export interface SelectObservationType {
  type: typeof SELECT_OBSERVATIONTYPE,
  observationType: string
}

export const selectObservationType = (dispatch: RootDispatch, observationType: string) => {
  dispatch({
    type: SELECT_OBSERVATIONTYPE,
    observationType
  });
};

export interface RemoveObservationType {
  type: typeof REMOVE_OBSERVATIONTYPE
}

export const removeObservationType = (dispatch: RootDispatch) => {
  dispatch({
    type: REMOVE_OBSERVATIONTYPE
  });
};

export interface UpdateSearch {
  type: typeof UPDATE_SEARCH,
  searchTerm: string
}

export const updateSearch = (dispatch: RootDispatch, searchTerm: string) => {
  dispatch({
    type: UPDATE_SEARCH,
    searchTerm
  });
};

export interface RemoveSearch {
  type: typeof REMOVE_SEARCH
}

export const removeSearch = (dispatch: RootDispatch) => {
  dispatch({
    type: REMOVE_SEARCH
  });
};

export interface UpdateOrder {
  type: typeof UPDATE_ORDER
  ordering: string
}

export const updateOrder = (dispatch: RootDispatch, ordering: string) => {
  dispatch({
    type: UPDATE_ORDER,
    ordering
  });
};

export interface UpdatePage {
  type: typeof UPDATE_PAGE,
  page: number
}

export const updatePage = (dispatch: RootDispatch, page: number) => {
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

export interface UpdateBasketWithRaster {
  type: typeof UPDATE_BASKET_WITH_RASTER,
  rasters: string[]
}

export interface RemoveRasterFromBasket {
  type: typeof REMOVE_RASTER_FROM_BASKET,
  uuid: string
}

export interface UpdateBasketWithWms {
  type: typeof UPDATE_BASKET_WITH_WMS,
  wmsLayers: string[]
}

export interface RemoveWmsFromBasket {
  type: typeof REMOVE_WMS_FROM_BASKET,
  uuid: string
}

export const updateBasketWithRaster = (rasters: string[], dispatch: RootDispatch): void => {
  dispatch({
    type: UPDATE_BASKET_WITH_RASTER,
    rasters
  });
};

export const removeRasterFromBasket = (uuid: string, dispatch: RootDispatch): void => {
  dispatch({
    type: REMOVE_RASTER_FROM_BASKET,
    uuid
  });
};

export const updateBasketWithWMS = (wmsLayers: string[], dispatch: RootDispatch): void => {
  dispatch({
    type: UPDATE_BASKET_WITH_WMS,
    wmsLayers
  });
};

export const removeWMSFromBasket = (uuid: string, dispatch: RootDispatch): void => {
  dispatch({
    type: REMOVE_WMS_FROM_BASKET,
    uuid
  });
};

//MARK: Toggle the showAlert
export const TOGGLE_ALERT = 'TOGGLE_ALERT';

export interface ToggleAlert {
  type: typeof TOGGLE_ALERT
}

export const toggleAlert = (dispatch: RootDispatch) => {
  dispatch({
    type: TOGGLE_ALERT
  });
};

//MARK: Request inbox messages
export const REQUEST_INBOX = 'REQUEST_INBOX';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
export const DOWNLOAD_FILE = 'DOWNLOAD_FILE';

export interface RequestInbox {
  type: typeof REQUEST_INBOX,
  messages: Message[]
}

export const requestInbox = (dispatch: RootDispatch) => {
  setInterval(() => {
    request
      .get(`/api/v3/inbox/?page_size=10000000`)
      .then(response => {
        dispatch({
          type: REQUEST_INBOX,
          messages: response.body.results
        });
      })
      .catch(console.error)
  }, 5000);
};

export interface RemoveMessage {
  type: typeof REMOVE_MESSAGE,
  id: string
}

export const removeMessage = (dispatch: RootDispatch, id: string) => {
  dispatch({
    type: REMOVE_MESSAGE,
    id
  });
};

export interface DownloadFile {
  type: typeof DOWNLOAD_FILE,
  id: string
}

export const downloadFile = (dispatch: RootDispatch, id: string) => {
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
export const REMOVE_ALL_EXPORT_GRID_CELLS = 'REMOVE_ALL_EXPORT_GRID_CELLS';
export const REQUEST_RASTER_EXPORTS = "REQUEST_RASTER_EXPORTS";
export const RECEIVED_TASK_RASTER_EXPORT = "RECEIVED_TASKS_RASTER_EXPORTS";
export const FAILED_TASK_RASTER_EXPORT = "FAILED_TASK_RASTER_EXPORT";
export const RECEIVED_PROJECTIONS = "RECEIVED_PROJECTIONS";
export const FETCHING_STATE_PROJECTIONS = "FETCHING_STATE_PROJECTIONS";
export const SET_RASTER_EXPORT_FORM_FIELDS = "SET_RASTER_EXPORT_FORM_FIELDS";
export const REMOVE_CURRENT_EXPORT_TASKS = "REMOVE_CURRENT_EXPORT_TASKS";

export const removeCurrentExportTasks = () => ({
  type: REMOVE_CURRENT_EXPORT_TASKS
});

export const removeFromSelectedExportGridCellIds = (gridCellIds: ExportGridCellId[]): RemoveFromSelectedExportGridCellIds => ({
  type: REMOVE_FROM_SELECTED_EXPORT_GRID_CELL_IDS,
  gridCellIds,
});
export const addToSelectedExportGridCellIds = (gridCellIds: ExportGridCellId[]): AddToSelectedExportGridCellIds => ({
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
export const updateExportRasterFormFields = (fieldValuePairs:FieldValuePair[]): SetRasterExportFormFields => ({
  type: SET_RASTER_EXPORT_FORM_FIELDS,
  fieldValuePairs,
});

export const setCurrentRasterExportsToStore = (numberOfInboxMessages:number): RequestRasterExports => ({
  type: REQUEST_RASTER_EXPORTS,
  numberOfInboxMessages,
})

export const receivedTaskRasterExport = (id: ExportGridCellId): ReceivedTaskRasterExport => ({
  type: RECEIVED_TASK_RASTER_EXPORT,
  id: id,
})

export const failedTaskRasterExport = (id: ExportGridCellId): FailedTaskRasterExport => ({
  type: FAILED_TASK_RASTER_EXPORT,
  id: id,
})
export const receivedProjections = (projections: Projection[]) : ReceivedProjections => ({
  type: RECEIVED_PROJECTIONS,
  projections,
})
export const setFetchingStateProjections = (fetchingState: FetchingState) : SetFetchingStateProjections => ({
  type: FETCHING_STATE_PROJECTIONS,
  fetchingState,
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

export const updateExportFormAndFetchExportGridCells = (fieldValuePairesToUpdate: FieldValuePair[]) => (dispatch: RootDispatch, getState: () => MyStore) =>
  {

    if (fieldValuePairsListContainsFieldThatShouldResetGridCells(fieldValuePairesToUpdate)) {
      dispatch(removeAllExportGridCells());
    }
    dispatch(updateExportRasterFormFields(fieldValuePairesToUpdate));

    const state = getState();
    const resolution = getExportGridCellResolution(state);
    const projection = getExportGridCellProjection(state);
    const tileWidth = getExportGridCellTileWidth(state);
    const tileHeight = getExportGridCellTileHeight(state);
    const rasterUuid = state.selectedItem;
    const bounds = getExportGridCellBounds(state);
    const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;

    request
      .get(`/api/v4/rasters/${rasterUuid}/grid/?projection=${projection}&cell_size=${resolution}&tile_height=${tileHeight}&tile_width=${tileWidth}&bbox=${boundsString}`)
      .then(response => {
        const gridCells = response.body.features;

        const newState = getState();
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

export const requestRasterExports = (numberOfInboxMessages:number) => (dispatch: RootDispatch, getState: () => MyStore) =>{

  dispatch(setCurrentRasterExportsToStore(numberOfInboxMessages));

  const state = getState();
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
                       `/api/v4/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&async=true&notify_user=true`
         :
                       `/api/v4/rasters/${rasterUuid}/data/?format=geotiff&bbox=${currentGridBbox}&projection=${projection}&width=${tileWidth}&height=${tileHeight}&start=${start}&async=true&notify_user=true`

                       request.get(requestUrl)
                              .then(() => {
                                dispatch(receivedTaskRasterExport(id));
                              })
                              .catch(error=>{
                                console.error(error);
                                dispatch(failedTaskRasterExport(id));
                              })

  });

};

export const requestProjections = (rasterUuid: string) => (dispatch: RootDispatch) => {
  dispatch(setFetchingStateProjections("SENT"));

  const requestUrl = `/api/v4/rasters/${rasterUuid}/projections/?page_size=100000`;
  request.get(requestUrl)
         .then(response => {
           dispatch(receivedProjections(response.body.results));
         })
         .catch(error=>{
           console.error(error);
           dispatch(setFetchingStateProjections("FAILED"));
         })
};

export type Action =
  BootstrapAction |
  DatasetsFetched |
  DownloadFile |
  ItemSelected |
  ObservationTypesFetched |
  OrganisationsFetched |
  RasterFetched |
  RastersFetched |
  RastersRequested |
  ReceiveWmsLayer |
  ReceiveWmsLayers |
  RemoveDataset |
  RemoveObservationType |
  RemoveOrganisation |
  RemoveRasterFromBasket |
  RemoveMessage |
  RemoveSearch |
  RemoveWmsFromBasket |
  RequestInbox |
  RequestWms |
  SelectDataset |
  SelectObservationType |
  SelectOrganisation |
  ToggleAlert |
  UpdateBasketWithRaster |
  UpdateBasketWithWms |
  UpdateOrder |
  UpdatePage |
  UpdateSearch
;
