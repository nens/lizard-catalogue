import request from 'superagent';
import { baseUrl } from './api';
import { Raster, RastersFetched, RasterSelected } from './interface';
import { Dispatch } from 'redux';

export const RASTERS_FETCHED = 'RASTERS_FETCHED';
export const RASTER_SELECTED = 'RASTER_SELECTED';

const rastersFetched = (rasters: Raster[]): RastersFetched => ({
    type: RASTERS_FETCHED,
    payload: rasters
});

export const fetchRasters = (page: number, searchTerm: string, dispatch: Dispatch<RastersFetched>): void => {
    request
        .get(`${baseUrl}/rasters?name__icontains=${searchTerm}&page=${page}`)
        .then(response => {
            dispatch(rastersFetched(response.body.results))
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
