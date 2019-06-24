import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster } from '../reducers';
import { Raster } from '../interface';
import './RasterDetails.css';

interface PropsFromState {
    raster: Raster | null
};

class RasterDetails extends React.Component<PropsFromState> {
    render() {
        //Destructure the props
        const { raster } = this.props;

        //If no raster is selected, display a text
        if (!raster) return <div className="raster-details raster-details__loading">Please select a raster</div>;

        //Set the Map with bounds coming from spatial_bounds of the Raster
        //If spatial_bounds is null then set the projection to the whole globe which is at [[85, 180], [-85, -180]]
        const { north, east, south, west } = raster.spatial_bounds ? 
            raster.spatial_bounds : {north: 85, east: 180, south: -85, west: -180};

        const bounds = [[north, east], [south, west]];

        //Get the Date from the timestamp string
        const startDate = new Date(raster.first_value_timestamp);
        const stopDate = new Date(raster.last_value_timestamp);

        //Turn the new Date into a string with the date format of DD-MM-YYYY
        const start = startDate.toLocaleDateString();
        const stop = stopDate.toLocaleDateString();

        //Calculate raster resolution and decide to show it in m2 or square degrees
        const rasterResolution = Math.abs(raster.pixelsize_x * raster.pixelsize_y);
        //If the projection is EPSG:4326, the resolution is calculated in square degrees, otherwise it is in m2
        const resolution = raster.projection === "EPSG:4326" ? rasterResolution.toFixed(6) + " deg2" : rasterResolution + " m2"
        
        return (
            <div className="raster-details">
                <h3>{raster.name}</h3>
                <span className="raster-details__uuid">{raster.uuid}</span>
                <div className="raster-details__main-box">
                    <div className="raster-details__description-box">
                        <h4>Description</h4>
                        <span>{raster.description}</span>
                        <br/>
                        <h4>Organisation</h4>
                        <span>{raster.organisation && raster.organisation.name}</span>
                    </div>
                    <div className="raster-details__map-box">
                        <Map bounds={bounds} >
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} />
                        </Map>
                    </div>
                </div>
                <div className="raster-details__data-1">
                    <div className="row">
                        <p className="column column-1">Temporal</p><p className="column column-2">{raster.temporal ? 'Yes' : 'No'} </p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Resolution</p><p className="column column-2">{resolution}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Datatype</p><p className="column column-2">Raster</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Interval</p><p className="column column-2">{raster.temporal ? raster.interval : null}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Start</p><p className="column column-2">{raster.temporal ? start : null}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Stop</p><p className="column column-2">{raster.temporal ? stop : null}</p>
                    </div>
                </div>
                <br />
                <div className="raster-details__data-2">
                    <div className="row">
                        <p className="column column-1">Observation type</p><p className="column column-2">{raster.observation_type && raster.observation_type.parameter}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Measuring unit</p><p className="column column-2">{raster.observation_type && raster.observation_type.unit}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Scale</p><p className="column column-2">{raster.observation_type && raster.observation_type.scale}</p>
                    </div>
                </div>
                <br/>
                <div className="raster-details__button-container">
                    <h4>View data in</h4>
                    <div>
                        <button className="raster-details__button button-api" onClick={() => window.open(`https://nxt3.staging.lizard.net/api/v4/rasters/${raster.uuid}`)}>API</button>
                        <button className="raster-details__button button-lizard" onClick={() => window.open(`https://nxt3.staging.lizard.net/nl/map/topography,raster$${raster.uuid.substr(0, 7)}`)}>PORTAL</button>
                    </div>
                </div>
            </div>
        );
    };    
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    if (!state.selectedRaster) return {
        raster: null 
    };
    return {
        raster: getRaster(state, state.selectedRaster)
    };
};

export default connect(mapStateToProps)(RasterDetails);