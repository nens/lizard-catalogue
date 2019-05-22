import * as React from 'react';
import { Raster } from '../interface';

interface MyProps {
    raster: Raster | null;
}

const RasterDetails = (props: MyProps) => {
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