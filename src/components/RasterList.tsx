import * as React from 'react';
import { Raster } from '../interface';

interface MyProps {
    rasters: Raster[] | null;
    selectRaster: (raster: Raster) => void;
}

const RasterList = (props: MyProps) => {
    const { rasters, selectRaster } = props;

    if (!rasters) return <h1>Loading ...</h1>;

    return (
        <div className="raster-list">
            <h3>Raster List</h3>
            {rasters.map((raster: Raster) => (
                <p key={raster.uuid} onClick={() => selectRaster(raster)}>{raster.name}</p>
            ))}
        </div>
    );
};

export default RasterList;
