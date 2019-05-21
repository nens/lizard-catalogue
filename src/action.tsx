import request from 'superagent';
import { baseUrl } from './api';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

const rastersFetched = (rasters) => ({
    type: RASTERS_FETCHED,
    payload: rasters
});

export const fetchRasters = dispatch => {
    request
        .get(`${baseUrl}/rasters`)
        .then(response => {
            dispatch(rastersFetched(response.body.results))
        })
        .catch(console.error)
};

const rasterSelected = (raster) => ({
    type: RASTER_SELECTED,
    payload: raster
});

export const selectRaster = (raster, dispatch) => {
    dispatch(rasterSelected(raster));
};