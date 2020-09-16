import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import MDSpinner from 'react-md-spinner';
import Leaflet from 'leaflet';
import inside from 'point-in-polygon'
import moment from 'moment';
import { Map, TileLayer, Marker, ZoomControl, Tooltip, Polygon } from 'react-leaflet';
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
import './../styles/Icons.css';

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

    // drawing polygon
    const [drawingMode, setDrawingMode] = useState(false);
    const [polygon, setPolygon] = useState<number[][]>([]);

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

    // Helper function to select locations in polygon
    const selectLocationsInPolygon = (locations: Location[]) => {
        const locationsInPolygon = locations.filter(
            location => location.geometry !== null
        ).filter(location =>
            // location with coordinates inside the polygon
            inside(location.geometry!.coordinates, polygon)
        ).map(location =>
            location.uuid
        ).filter(uuid =>
            // remove duplicates
            selectedLocations.indexOf(uuid) < 0
        );
        // Update the list of selected locations
        setSelectedLocations(selectedLocations.concat(locationsInPolygon));
    };

    return (
        <div className="modal-main modal-timeseries">
            <div className="modal-header">
                <span>Select Time-series</span>
                <button onClick={props.toggleTimeseriesModal}>&times;</button>
            </div>
            <div className="timeseries">
                <div className="timeseries-filter">
                    <div className="timeseries-top">
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
                                attributionControl={false}
                                style={{
                                    opacity: locationsObject.isFetching || (filteredLocationObject && filteredLocationObject.isFetching) ? 0.4 : 1,
                                    cursor: drawingMode ? "default" : "pointer"
                                }}
                                onClick={(e) => {
                                    if (drawingMode) {
                                        setPolygon([...polygon, [e.latlng.lat, e.latlng.lng]]);
                                    } else {
                                        polygon.length && setPolygon([]);
                                    };
                                }}
                            >
                                <ZoomControl position="bottomleft"/>
                                <Polygon
                                    positions={polygon}
                                    color={"var(--main-color-scheme)"}
                                />
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
                            {drawingMode ? (
                                <div className="polygon-button-container">
                                    {/* Cancel polygon button */}
                                    <button
                                        className="button-action button-polygon"
                                        onClick={() => {
                                            setPolygon([]);
                                            setDrawingMode(false);
                                        }}
                                        title="Cancel"
                                    >
                                        <i className="fa fa-times" />
                                    </button>
                                    {/* Re-draw last step button */}
                                    <button
                                        className="button-action button-polygon"
                                        onClick={() => setPolygon(polygon.slice(0, -1))}
                                        title="Re-draw"
                                        disabled={!polygon.length}
                                    >
                                        <i className="fa fa-repeat" />
                                    </button>
                                    {/* Confirm polygon button */}
                                    <button
                                        className="button-action button-polygon"
                                        onClick={() => {
                                            if (filteredLocations) {
                                                selectLocationsInPolygon(Object.values(filteredLocations));
                                            } else {
                                                selectLocationsInPolygon(Object.values(locations));
                                            };
                                            setDrawingMode(false);
                                        }}
                                        title="Confirm"
                                        disabled={polygon.length < 3}
                                    >
                                        <i className="fa fa-check" />
                                    </button>
                                </div>
                            ) : (
                                <div className="polygon-button-container">
                                    {/* Start drawing polygon button */}
                                    <button
                                        className="button-action button-polygon"
                                        onClick={() => {
                                            setPolygon([]);
                                            setDrawingMode(true);
                                        }}
                                        title="Draw"
                                    >
                                        <img
                                            src="image/polygon.svg"
                                            alt="polygon"
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="timeseries-filter-bar">
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
                </div>
                <div className="timeseries-selection">
                    <div className="timeseries-top">
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
                                        <li key={uuid}>
                                            <span
                                                className="timeseries-location-name"
                                                title={"Click to zoom into this selected location"}
                                                onClick={() => setLocationOnZoom(uuid)}
                                            >
                                                {location.name} [{location.code}] [{locationTimeseries.map(ts => ts.observation_type.parameter).join(', ')}]
                                            </span>
                                            <button
                                                className="button-delete"
                                                onClick={() => setSelectedLocations(selectedLocations.filter(locationUuid => locationUuid !== uuid))}
                                            >
                                                <i className="fa fa-trash icon-delete" />
                                            </button>
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