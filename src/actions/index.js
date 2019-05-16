import request from 'superagent';
import { baseUrl } from '../apis/raster-api'

const rastersFetched = (rasters) => ({
    type: 'RASTERS_FETCHED',
    payload: rasters
})

export const fetchRasters = () => (dispatch, getState) => {
    if (getState().rasters) return 

    request
        .get(`${baseUrl}/rasters`)
        .then(response => {
            console.log(baseUrl)
            dispatch(rastersFetched(response.body.results))
        })
        .catch(console.error)
}

