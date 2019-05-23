import * as React from 'react';
import { Raster } from '../interface';
import { Map, TileLayer } from 'react-leaflet';

import './RasterDetails.css';

interface MyProps {
    raster: Raster | null;
}

const RasterDetails = (props: MyProps) => {

    const { raster } = props;

    if (!raster) return <div className="raster-details raster-details__loading">Please select a raster</div>;

    //Set the Map with bounds coming from spatial_bounds of the Raster
    const { north, east, south, west } = raster.spatial_bounds;
    const bounds = [[north, east], [south, west]];

    //Get the Date from the timestamp string
    const startDate = new Date(raster.first_value_timestamp);
    const stopDate = new Date(raster.last_value_timestamp);

    //Turn the new Date into a string with the date format of YYYY-MM-DD 
    const start = `${startDate.getFullYear()}-${startDate.getMonth() < 10 ? `0${startDate.getMonth()}` : `${startDate.getMonth()}`}-${startDate.getDate() < 10 ? `0${startDate.getDate()}` : `${startDate.getDate()}`}`;
    const stop = `${stopDate.getFullYear()}-${stopDate.getMonth() < 10 ? `0${stopDate.getMonth()}` : `${stopDate.getMonth()}`}-${stopDate.getDate() < 10 ? `0${stopDate.getDate()}` : `${stopDate.getDate()}`}`;
    
    return (
        <div className="raster-details">
            <a href="/" className="raster-details__name">{raster.name}</a>
            <span className="raster-details__uuid">{raster.uuid}</span>
            <div className="raster-details__main-box">
                <div className="raster-details__description-box">
                    <h4>Description</h4>
                    <span>{raster.description}</span>
                    <br/>
                    <h4>Organisation</h4>
                    <span>{raster.organisation.name}</span>
                </div>
                <div className="raster-details__map-box">
                    <Map bounds={bounds} >
                        <TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
                    </Map>
                </div>
            </div>
            <div className="raster-details__data-1">
                <div className="row">
                    <p className="column column-1">Temporal</p><p className="column column-2">{raster.temporal ? 'Yes' : 'No'} </p>
                </div>
                <div className="row">
                    <p className="column column-1">Resolution</p><p className="column column-2">{raster.resolution}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Datatype</p><p className="column column-2">{raster.data_type}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Interval</p><p className="column column-2">{raster.interval}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Start</p><p className="column column-2">{start}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Stop</p><p className="column column-2">{stop}</p>
                </div>
            </div>
            <br />
            <div className="raster-details__data-2">
                <div className="row">
                    <p className="column column-1">Observation type</p><p className="column column-2">{raster.observation_type.code}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Measuring unit</p><p className="column column-2">{raster.observation_type.unit}</p>
                </div>
                <div className="row">
                    <p className="column column-1">Scale</p><p className="column column-2">{raster.observation_type.scale}</p>
                </div>
            </div>
            <br/>
            <div className="raster-details__button-container">
                <button className="raster-details__button">WMS</button>
                <h4>View data in</h4>
                <div>
                    <button className="raster-details__button button-api">API</button>
                    <button className="raster-details__button button-lizard">LIZARD</button>
                </div>
            </div>
        </div>
    );
};

export default RasterDetails;