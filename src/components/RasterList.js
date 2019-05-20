import React from 'react';

const RasterList = (props) => {
    const { rasters, selectRaster } = props;

    if (!rasters) return <h1>Loading ...</h1>;

    return (
        <div>
            {rasters.map(raster => (
                <p key={raster.uuid} onClick={() => selectRaster(raster)}>{raster.name}</p>
            ))}
        </div>
    );
};

export default RasterList;