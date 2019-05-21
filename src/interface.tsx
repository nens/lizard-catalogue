export interface MyStore {
    rasters: object[];
    selectedRaster: Raster
};

export interface MyProps {
    rasters: [];
    raster: {};
    selectRaster(): {};
    fetchRasters(): []
};

export interface Raster {
    uuid: string;
    name: string;
    organisation: string
};