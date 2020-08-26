import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import MDSpinner from 'react-md-spinner';
import Leaflet from 'leaflet';
import moment from 'moment';
import { Map, TileLayer, Marker, ZoomControl, Tooltip } from 'react-leaflet';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import {
    getSelectedItem,
    getTimeseriesObjectNotNull,
    getLocationsObjectNotNull,
    getMonitoringNetworkObservationTypesNotNull,
    getFilteredLocationsObject
} from './../../reducers';
import { fetchFilteredLocations, removeFilteredLocations } from './../../action';
import { requestTimeseriesExport, openTimeseriesInAPI } from './../../utils/url';
import SearchBar from './SearchBar';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import '../styles/TimeSeriesModal.css';
import '../styles/Modal.css';
import './../styles/Buttons.css';

interface MyProps {
    toggleTimeseriesModal: () => void
};

const TimeSeriesModal: React.FC<MyProps & PropsFromDispatch> = (props) => {
    const selectedItem = useSelector(getSelectedItem);
    const timeseriesObject = useSelector(getTimeseriesObjectNotNull);
    const { timeseries } = timeseriesObject;

    const observationTypeObject = useSelector(getMonitoringNetworkObservationTypesNotNull);
    const { observationTypes } = observationTypeObject;

    const locationsObject = useSelector(getLocationsObjectNotNull);
    const { locations } = locationsObject;
    const locationUUIDs = Object.keys(locations);

    const filteredLocationsObject = useSelector(getFilteredLocationsObject);
    const filteredLocations = filteredLocationsObject && filteredLocationsObject.filteredLocations;
    const filteredLocationUUIDs = filteredLocations && Object.keys(filteredLocations);

    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [locationOnZoom, setLocationOnZoom] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');

    const [selectedObservationTypeCode, setSelectedObservationTypeCode] = useState<string>('');

    // start and end for selected period in milliseconds
    const defaultEndValue = new Date().valueOf();
    const defaultStartValue = defaultEndValue - 1000 * 60 * 60 * 24 * 1; // default start value is 1 day before current date
    const [start, setStart] = useState<number>(defaultStartValue);
    const [end, setEnd] = useState<number>(defaultEndValue);

    const onSearchSubmit = (event) => {
        event.preventDefault();
        if (searchInput || selectedObservationTypeCode) {
            props.fetchFilteredLocations(selectedItem, searchInput, selectedObservationTypeCode);
        } else {
            // no filter option selected
            props.removeFilteredLocations();
        };
    };

    useEffect(() => {
        const closeModalOnEsc = (e) => {
            if (e.key === 'Escape') {
                props.toggleTimeseriesModal();
            };
        };
        window.addEventListener('keydown', closeModalOnEsc);
        return () => window.removeEventListener('keydown', closeModalOnEsc);
    });

    // useEffect to call removeFilteredLocations() when component unmounts
    useEffect(() => {
        return () => props.removeFilteredLocations();
    }, [props]);

    return (
        <div className="modal-main modal-timeseries">
            <div className="modal-header">
                <span>Select Time-series</span>
                <button onClick={props.toggleTimeseriesModal}>&times;</button>
            </div>
            <div className="timeseries">
                <div className="timeseries-filter">
                    <h3>1. SELECT LOCATIONS</h3>
                    <span className="timeseries-helper-text">Select locations by clicking or select all locations with the same observation type</span>
                    <div className="timeseries-map">
                        <div className="timeseries-search-locations">
                            <SearchBar
                                name="searchBar"
                                searchTerm={searchInput}
                                title="Type name of locations"
                                placeholder="Search for locations"
                                onSearchChange={e => setSearchInput(e.currentTarget.value)}
                                onSearchSubmit={onSearchSubmit}
                            />
                        </div>
                        {locationsObject.isFetching || (filteredLocationsObject && filteredLocationsObject.isFetching) ? (
                            <div className="details-map-loading">
                                <MDSpinner />
                            </div>
                        ) : null}
                        <Map
                            bounds={filteredLocationsObject ? filteredLocationsObject.spatialBounds : locationsObject.spatialBounds}
                            center={locationOnZoom ? locations[locationOnZoom].geometry!.coordinates : null}
                            zoom={locationOnZoom ? 14 : null}
                            zoomControl={false}
                            style={{
                                opacity: locationsObject.isFetching || (filteredLocationsObject && filteredLocationsObject.isFetching) ? 0.4 : 1
                            }}
                        >
                            <ZoomControl position="bottomleft"/>
                            {(filteredLocationUUIDs || locationUUIDs).map(locationUuid => {
                                const location = locations[locationUuid];
                                if (location.geometry) {
                                    return (
                                        <Marker
                                            key={location.uuid}
                                            position={location.geometry.coordinates}
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
                    {observationTypeObject.isFetching ? (
                        <MDSpinner />
                    ) : (
                        <ul className="timeseries-observation-list">
                            {observationTypes.map(observationType => (
                                <li key={observationType.id}>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.currentTarget.checked) {
                                                setSelectedObservationTypeCode(observationType.code);
                                                props.fetchFilteredLocations(selectedItem, searchInput, observationType.code);
                                            } else {
                                                // uncheck checkbox
                                                setSelectedObservationTypeCode('');
                                                if (searchInput) {
                                                    props.fetchFilteredLocations(selectedItem, searchInput, '')
                                                } else {
                                                    // no filter options selected
                                                    props.removeFilteredLocations();
                                                };
                                            };
                                        }}
                                        checked={selectedObservationTypeCode === observationType.code}
                                    />
                                    {observationType.parameter ? observationType.parameter : observationType.code}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="timeseries-selection">
                    <div className="timeseries-selected-locations">
                        <div className="timeseries-selected-locations-header">
                            <div>
                                <h3>2. SELECTED LOCATIONS</h3>
                                <span className="timeseries-helper-text">The selected locations will appear here</span>
                            </div>
                            <button
                                className="button-action timeseries-button-clear-selection"
                                onClick={() => setSelectedLocations([])}
                                disabled={!selectedLocations.length}
                                title="Clear selection"
                            >
                                CLEAR SELECTION
                            </button>
                        </div>
                        <ul className="timeseries-location-list">
                            {selectedLocations.map(uuid => {
                                const location = locations[uuid];
                                const locationTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                return (
                                    <li
                                        key={uuid}
                                        title={"Click to zoom into this selected location"}
                                        onClick={() => setLocationOnZoom(uuid)}
                                    >
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
                                <Datetime
                                    value={moment(defaultStartValue)}
                                    dateFormat={'DD/MM/YYYY'}
                                    timeFormat={'H:mm'}
                                    inputProps={{className: 'timeseries-datetime'}}
                                    onChange={(e) => setStart(moment(e).valueOf())}
                                />
                            </div>
                            <span className="timeseries-period-arrow">&#8594;</span>
                            <div className="timeseries-time-selection">
                                <span>End</span>
                                <Datetime
                                    value={moment(defaultEndValue)}
                                    dateFormat={'DD/MM/YYYY'}
                                    timeFormat={'H:mm'}
                                    inputProps={{className: 'timeseries-datetime'}}
                                    onChange={(e) => setEnd(moment(e).valueOf())}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="timeseries-button-container">
                        <div className="timeseries-buttons">
                            <button
                                className="button-action"
                                title="Open in API"
                                onClick={() => {
                                    selectedLocations.map(uuid => {
                                        const selectedTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                        return selectedTimeseries.map(ts => openTimeseriesInAPI(ts.uuid));
                                    });
                                }}
                                disabled={!selectedLocations.length}
                            >
                                OPEN IN API
                            </button>
                            <button
                                className="button-action"
                                title="Open in Portal"
                                onClick={() => null}
                                disabled={!selectedLocations}
                            >
                                OPEN IN PORTAL
                            </button>
                        </div>
                        <div className="timeseries-buttons">
                            <button className="button-action" style={{visibility: "hidden"}} />
                            <button
                                className="button-action"
                                title="Export Time-series"
                                onClick={() => {
                                    selectedLocations.map(uuid => {
                                        const selectedTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                        return selectedTimeseries.map(ts => requestTimeseriesExport(ts.uuid, start, end));
                                    });
                                }}
                                disabled={!selectedLocations.length}
                            >
                                EXPORT TIME-SERIES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => ({
    fetchFilteredLocations: (uuid: string, searchInput?: string, observationTypeCode?: string) => dispatch(fetchFilteredLocations(uuid, searchInput, observationTypeCode)),
    removeFilteredLocations: () => dispatch(removeFilteredLocations()),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(TimeSeriesModal);