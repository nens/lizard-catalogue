import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import MDSpinner from 'react-md-spinner';
import Leaflet from 'leaflet';
import moment from 'moment';
import { Map, TileLayer, Marker, ZoomControl, Tooltip } from 'react-leaflet';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import {
    getSelectedItem,
    getTimeseriesObject,
    getLocationsObjectNotNull,
    getMonitoringNetworkObservationTypesNotNull,
} from './../../reducers';
import { fetchTimeseries, removeTimeseries } from './../../action';
import { requestTimeseriesExport, openTimeseriesInAPI, openLocationsInLizard } from './../../utils/url';
import { getSpatialBounds, getGeometry } from '../../utils/getSpatialBounds';
import { Location } from '../../interface';
import SearchBar from './SearchBar';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import '../styles/TimeSeriesModal.css';
import '../styles/Modal.css';
import './../styles/Buttons.css';

interface MyProps {
    toggleTimeseriesModal: () => void
};

interface filteredLocationObject {
    isFetching: boolean,
    filteredLocations: {
        [uuid: string]: Location
    },
    spatialBounds: number[][]
};

const TimeSeriesModal: React.FC<MyProps & PropsFromDispatch> = (props) => {
    const selectedItem = useSelector(getSelectedItem);
    const timeseriesObject = useSelector(getTimeseriesObject);

    const observationTypeObject = useSelector(getMonitoringNetworkObservationTypesNotNull);
    const { observationTypes } = observationTypeObject;

    const locationsObject = useSelector(getLocationsObjectNotNull);
    const { locations } = locationsObject;
    const locationUUIDs = Object.keys(locations);

    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [locationOnZoom, setLocationOnZoom] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');
    const [finalSearchInput, setFinalSearchInput] = useState<string>('');

    const [selectedObservationTypeCode, setSelectedObservationTypeCode] = useState<string>('');

    // start and end for selected period in milliseconds
    const defaultEndValue = new Date().valueOf();
    const defaultStartValue = defaultEndValue - 1000 * 60 * 60 * 24 * 1; // default start value is 1 day before current date
    const [start, setStart] = useState<number>(defaultStartValue);
    const [end, setEnd] = useState<number>(defaultEndValue);

    // filter state for locations
    const [filteredLocationObject, setFilteredLocationObject] = useState<filteredLocationObject | null>(null);
    const filteredLocations = filteredLocationObject && filteredLocationObject.filteredLocations;
    const filteredLocationUUIDs = filteredLocations && Object.keys(filteredLocations);

    // useEffect to fetch new state of locations based on filter inputs
    useEffect(() => {
        if (finalSearchInput || selectedObservationTypeCode) {
            // Set to loading state
            setFilteredLocationObject({
                isFetching: true,
                filteredLocations: {},
                spatialBounds: [[85, 180], [-85, -180]]
            });

            // Building queries based on filter inputs
            const params: string[] = [`page_size=10000`];

            if (finalSearchInput) params.push(`name__icontains=${encodeURIComponent(finalSearchInput)}`);
            if (selectedObservationTypeCode) params.push(`timeseries__observation_type__code=${encodeURIComponent(selectedObservationTypeCode)}`);

            const queries = params.join('&');

            // Fetching action
            fetch(`/api/v4/monitoringnetworks/${selectedItem}/locations/?${queries}`)
                .then(response => response.json())
                .then(data => {
                    const locationList = data.results as Location[];
                    const filteredLocations = {} as {[uuid: string]: Location};
                    locationList.forEach(location => {
                        filteredLocations[location.uuid] = {
                            ...location,
                            geometry: getGeometry(location)
                        };
                    });
                    // Update state of filtered locations
                    setFilteredLocationObject({
                        isFetching: false,
                        filteredLocations,
                        spatialBounds: getSpatialBounds(locationList)
                    });
                })
                .catch(console.error);
        } else {
            // Remove state of filtered locations
            setFilteredLocationObject(null);
        };
    }, [selectedItem, finalSearchInput, selectedObservationTypeCode])

    // Add event listener to close modal on ESCAPE
    useEffect(() => {
        const closeModalOnEsc = (e) => {
            if (e.key === 'Escape') {
                props.toggleTimeseriesModal();
            };
        };
        window.addEventListener('keydown', closeModalOnEsc);
        return () => window.removeEventListener('keydown', closeModalOnEsc);
    });

    // useEffect to fetch timeseries when component first mounted
    // and remove timeseries when component unmounts
    useEffect(() => {
        props.fetchTimeseries(selectedItem);
        return () => props.removeTimeseries();
    }, [selectedItem, props]);

    if (!timeseriesObject || timeseriesObject.isFetching) return (
        <div className="modal-main modal-timeseries modal-timeseries-loading">
            <MDSpinner size={100}  style={{ marginBottom: "20px" }}/>
            Loading Time-Series for this Monitoring Network ...
        </div>
    );

    const { timeseries } = timeseriesObject;

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
                                onSearchSubmit={e => {
                                    e.preventDefault();
                                    setFinalSearchInput(searchInput);
                                }}
                            />
                        </div>
                        {locationsObject.isFetching || (filteredLocationObject && filteredLocationObject.isFetching) ? (
                            <div className="details-map-loading">
                                <MDSpinner />
                            </div>
                        ) : null}
                        <Map
                            bounds={filteredLocationObject ? filteredLocationObject.spatialBounds : locationsObject.spatialBounds}
                            center={locationOnZoom ? locations[locationOnZoom].geometry!.coordinates : null}
                            zoom={locationOnZoom ? 18 : null}
                            zoomControl={false}
                            style={{
                                opacity: locationsObject.isFetching || (filteredLocationObject && filteredLocationObject.isFetching) ? 0.4 : 1
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
                                            } else {
                                                // uncheck checkbox
                                                setSelectedObservationTypeCode('');
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
                                    dateFormat={'DD/MM/YYYY'}
                                    timeFormat={'HH:mm'}
                                    inputProps={{
                                        className: 'timeseries-datetime',
                                        placeholder: moment(defaultStartValue).format('DD/MM/YYYY HH:mm')
                                    }}
                                    onChange={(e) => setStart(moment(e).valueOf())}
                                />
                            </div>
                            <span className="timeseries-period-arrow">&#8594;</span>
                            <div className="timeseries-time-selection">
                                <span>End</span>
                                <Datetime
                                    dateFormat={'DD/MM/YYYY'}
                                    timeFormat={'HH:mm'}
                                    inputProps={{
                                        className: 'timeseries-datetime',
                                        placeholder: moment(defaultEndValue).format('DD/MM/YYYY HH:mm')
                                    }}
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
                                    const arrayOfTimeseriesUUIDs = selectedLocations.map(uuid => {
                                        const selectedTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                        return selectedTimeseries.map(ts => ts.uuid);
                                    });
                                    return openTimeseriesInAPI(arrayOfTimeseriesUUIDs);
                                }}
                                disabled={!selectedLocations.length}
                            >
                                OPEN IN API
                            </button>
                            <button
                                className="button-action"
                                title="Open in Portal"
                                onClick={() => {
                                    const arrayOfLocations = selectedLocations.map(uuid => locations[uuid]);
                                    return openLocationsInLizard(arrayOfLocations, start, end);
                                }}
                                disabled={!selectedLocations.length}
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
                                    const arrayOfTimeseriesUUIDs = selectedLocations.map(uuid => {
                                        const selectedTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                                        return selectedTimeseries.map(ts => ts.uuid);
                                    });
                                    return requestTimeseriesExport(arrayOfTimeseriesUUIDs, start, end);
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
    fetchTimeseries: (uuid: string) => dispatch(fetchTimeseries(uuid)),
    removeTimeseries: () => dispatch(removeTimeseries()),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(TimeSeriesModal);