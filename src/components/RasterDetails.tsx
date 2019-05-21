import * as React from 'react';

const RasterDetails = (props) => {
    const { raster } = props;

    if (!raster) return <h4>Raster Details</h4>;

    return (
        <div className="raster-details">
            <h4>Raster Details</h4>
            <p>Name: {raster.name}</p>
            <p>Organisation: {raster.organisation.name}</p>
        </div>
    );
};

export default RasterDetails;