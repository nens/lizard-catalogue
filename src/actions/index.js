import request from 'superagent';
import { baseUrl } from '../apis/raster-api';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';

const rastersFetched = (rasters) => ({
    type: RASTERS_FETCHED,
    payload: rasters
});

export const fetchRasters = () => (dispatch, getState) => {
    if (getState().rasters) return 

    request
        .get(`${baseUrl}/rasters`)
        .then(response => {
            dispatch(rastersFetched(response.body.results))
        })
        .catch(console.error)
};



