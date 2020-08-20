import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import MDSpinner from 'react-md-spinner';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import { getTimeseriesObject, getLocationsObject } from './../../reducers';
import '../styles/TimeSeriesModal.css';
import '../styles/Modal.css';

interface MyProps {
    toggleExportModal: () => void
};

const TimeSeriesModal: React.FC<MyProps> = (props) => {
    const timeseriesObject = useSelector(getTimeseriesObject);
    const locationsObject = useSelector(getLocationsObject);
    const observationTypes = Object.values(timeseriesObject.observationTypes);
    const locations = Object.values(locationsObject.locations);
    const spatialBounds = locationsObject.spatialBounds;

    const closeModalOnEsc = (e) => {
        if (e.key === 'Escape') {
            props.toggleExportModal();
        };
    };

    useEffect(() => {
        window.addEventListener('keydown', closeModalOnEsc);
        return () => window.removeEventListener('keydown', closeModalOnEsc);
    });

    return (
        <div className="modal-main modal-timeseries">
            <div className="modal-header">
                <span>Select Time-series</span>
                <button onClick={props.toggleExportModal}>&times;</button>
            </div>
            <div className="timeseries">
                <div className="timeseries-filter">
                    <h3>1. SELECT LOCATIONS</h3>
                    <span className="timeseries-helper-text">Select locations by clicking or select all locations with the same observation type</span>
                    <div className="timeseries-map">
                        {locationsObject.isFetching ? (
                            <div className="details-map-loading">
                                <MDSpinner />
                            </div>
                        ) : null}
                        <Map
                            bounds={spatialBounds}
                            zoom={10}
                            zoomControl={false}
                            style={{
                                opacity: locationsObject.isFetching ? 0.4 : 1
                            }}
                        >
                            <ZoomControl position="bottomleft"/>
                            {locations.map(location => (
                                location.geometry &&
                                <Marker
                                    key={location.uuid}
                                    position={[location.geometry.coordinates[1], location.geometry.coordinates[0]]}
                                    icon={
                                      new Leaflet.DivIcon({
                                        className: "point-icon point-icon-large"
                                      })
                                    }
                                />
                            ))}
                            <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                        </Map>
                    </div>
                    <h3>FILTER OBSERVATION TYPE</h3>
                    <ul className="timeseries-observation-list">
                        {observationTypes && observationTypes.map(observationType => (
                            <li key={observationType.id}>
                                <input type="checkbox"/>
                                {observationType.parameter}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="timeseries-selection">
                    <div className="timeseries-selected-locations">
                        <h3>2. SELECTED LOCATIONS</h3>
                        <span className="timeseries-helper-text">The selected locations will appear here</span>
                        <ul className="timeseries-location-list">
                            <li>Location 1 [code] [observation]</li>
                            <li>Location 2 [code] [observation]</li>
                        </ul>
                    </div>
                    <div className="timeseries-period">
                        <h3>3. SELECT PERIOD</h3>
                        <span className="timeseries-helper-text">Define a time period for your time-series</span>
                        <div className="timeseries-period-container">
                            <div className="timeseries-time-selection">
                                <span>Start</span>
                                <input type="text"/>
                            </div>
                            <div className="timeseries-time-selection">
                                <span>End</span>
                                <input type="text"/>
                            </div>
                        </div>
                    </div>
                    <div className="timeseries-button-container">
                        <div className="timeseries-buttons">
                            <button className="button-action" title="Open in API">
                                OPEN IN API
                            </button>
                            <button className="button-action" title="Open in Portal">
                                OPEN IN PORTAL
                            </button>
                        </div>
                        <div className="timeseries-buttons">
                            <button className="button-action" style={{visibility: "hidden"}} />
                            <button className="button-action" title="Export Time-series">
                                EXPORT TIME-SERIES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeSeriesModal;