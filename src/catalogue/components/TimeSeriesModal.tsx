import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MDSpinner from 'react-md-spinner';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker, ZoomControl, Tooltip } from 'react-leaflet';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import { getTimeseriesObject, getLocationsObject } from './../../reducers';
import '../styles/TimeSeriesModal.css';
import '../styles/Modal.css';

interface MyProps {
    toggleExportModal: () => void
};

const TimeSeriesModal: React.FC<MyProps> = (props) => {
    const timeseriesObject = useSelector(getTimeseriesObject);
    const observationTypes = Object.values(timeseriesObject.observationTypes);
    const timeseries = timeseriesObject.timeseries;

    const locationsObject = useSelector(getLocationsObject);
    const locations = locationsObject.locations;
    const locationUUIDs = Object.keys(locations);
    const spatialBounds = locationsObject.spatialBounds;

    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [filterdLocations, setFilteredLocations] = useState<string[]>([]);
    const [locationInView, setLocationInView] = useState<string>('');

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
                            center={locationInView ? [locations[locationInView].geometry!.coordinates[1], locations[locationInView].geometry!.coordinates[0]] : null}
                            zoom={locationInView ? 14 : null}
                            zoomControl={false}
                            style={{
                                opacity: locationsObject.isFetching ? 0.4 : 1
                            }}
                        >
                            <ZoomControl position="bottomleft"/>
                            {(filterdLocations.length ? filterdLocations : locationUUIDs).map(locationUuid => {
                                const location = locations[locationUuid];
                                if (location.geometry) {
                                    const { coordinates } = location.geometry;
                                    return (
                                        <Marker
                                            key={location.uuid}
                                            position={[coordinates[1], coordinates[0]]}
                                            icon={
                                                new Leaflet.DivIcon({
                                                    iconSize: [24, 24],
                                                    tooltipAnchor: [12, 0],
                                                    className: selectedLocations.includes(locationUuid) ? "location-icon location-icon-selected" : "location-icon"
                                                })
                                            }
                                            onClick={() => {
                                                if (selectedLocations.includes(locationUuid)) {
                                                    setSelectedLocations(selectedLocations.filter(uuid => uuid !== locationUuid));
                                                } else {
                                                    setSelectedLocations([...selectedLocations, locationUuid]);
                                                };
                                            }}
                                        >
                                            <Tooltip>{location.code}</Tooltip>
                                        </Marker>
                                    )
                                };
                                return null;
                            })}
                            <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                        </Map>
                    </div>
                    <h3>FILTER OBSERVATION TYPE</h3>
                    {timeseriesObject.isFetching ? (
                        <MDSpinner />
                    ) : (
                        <ul className="timeseries-observation-list">
                            {observationTypes && observationTypes.map(observationType => (
                                <li key={observationType.id}>
                                    <input
                                        type="checkbox"
                                        onClick={(e) => {
                                            const observationTypeTimeseries = Object.values(timeseries).filter(ts => ts.observation_type.id === observationType.id);
                                            const observationTypeLocations = observationTypeTimeseries.map(ts => ts.location.uuid);
                                            const uniqueLocationUuid = Array.from(new Set(observationTypeLocations));
                                            if (e.currentTarget.checked) {
                                                setFilteredLocations([...filterdLocations, ...uniqueLocationUuid]);
                                            } else {
                                                setFilteredLocations(filterdLocations.filter(uuid => observationTypeLocations.includes(uuid) === false))
                                            }
                                        }}
                                    />
                                    {observationType.parameter ? observationType.parameter : observationType.code}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="timeseries-selection">
                    <div className="timeseries-selected-locations">
                        <h3>2. SELECTED LOCATIONS</h3>
                        <span className="timeseries-helper-text">The selected locations will appear here</span>
                        <ul className="timeseries-location-list">
                            {selectedLocations.map(uuid => {
                                const location = locationsObject.locations[uuid];
                                const locationTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                return (
                                    <li key={uuid} onClick={() => setLocationInView(uuid)}>
                                        <span>{location.name}</span> [{location.code}] [{locationTimeseries.map(ts => ts.observation_type.parameter).join(', ')}]
                                    </li>
                                )
                            })}
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