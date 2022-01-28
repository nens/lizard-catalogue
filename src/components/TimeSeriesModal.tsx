import { FC, useEffect, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { RootDispatch } from '../store.js';
import MDSpinner from 'react-md-spinner';
import { DivIcon, LatLngExpression, LeafletMouseEvent } from 'leaflet';
import inside from 'point-in-polygon'
import moment from 'moment';
import { Map, TileLayer, Marker, ZoomControl, Tooltip, Polygon } from 'react-leaflet';
import { mapBoxAccesToken } from "./../mapboxConfig.js";
import {
    getSelectedItem,
    getTimeseriesObject,
    getLocationsObjectNotNull,
    getMonitoringNetworkObservationTypesNotNull,
} from './../reducers';
import { fetchTimeseries, removeTimeseries } from './../action';
import { convertToLatLngBounds } from './../utils/latLngZoomCalculation';
import { openTimeseriesInAPI, openLocationsInLizard } from './../utils/url';
import { timeValidator } from './../utils/timeValidator';
import { getSpatialBounds, getGeometry } from './../utils/getSpatialBounds';
import { recursiveFetchFunction } from './../hooks';
import { Location, ObservationType, TimeSeries } from './../interface';
import { TimeseriesPeriodFilter } from './TimeseriesPeriodFilter';
import { convertToSelectObject, Dropdown } from './Dropdown';
import TimeSeriesExportModal from './TimeseriesExportModal';
import SearchBar from './SearchBar';
import polygonIcon from './../images/polygon.svg';
import styles from './TimeseriesModal.module.css';
import mapStyles from './../styles/Details.module.css';
import modalStyles from '../styles/Modal.module.css';
import buttonStyles from '../styles/Buttons.module.css';

interface MyProps {
    closeTimeseriesModal: () => void
};

interface filteredLocationObject {
    isFetching: boolean,
    filteredLocations: {
        [uuid: string]: Location
    },
    spatialBounds: number[][] | null,
    centerPoint: number[] | null,
};

const TimeSeriesModal: FC<MyProps & PropsFromDispatch> = (props) => {
    const { fetchTimeseries, removeTimeseries, closeTimeseriesModal } = props;
    const mapRef = useRef<Map>(null);

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
    const [selectedObservationType, setSelectedObservationType] = useState<ObservationType | null>(null);

    // list of selected timeseries
    const [selectedTimeseries, setSelectedTimeseries] = useState<TimeSeries[]>([]);

    // start and end for selected period in milliseconds
    const [start, setStart] = useState<number | null>(null);
    const [end, setEnd] = useState<number | null>(null);

    // filter state for locations
    const [filteredLocationObject, setFilteredLocationObject] = useState<filteredLocationObject | null>(null);
    const filteredLocations = filteredLocationObject && filteredLocationObject.filteredLocations;
    const filteredLocationUUIDs = filteredLocations && Object.keys(filteredLocations);

    // drawing polygon
    const [drawingMode, setDrawingMode] = useState(false);
    const [polygon, setPolygon] = useState<LatLngExpression[]>([]);

    // timeseries export modal
    const [exportModal, setExportModal] = useState<boolean>(false);

    // useEffect to fetch new state of locations based on filter inputs
    useEffect(() => {
        if (finalSearchInput || selectedObservationType || start || end) {
            // Set to loading state
            setFilteredLocationObject({
                isFetching: true,
                filteredLocations: {},
                spatialBounds: null,
                centerPoint: null
            });

            // Building queries based on filter inputs
            const params: string[] = [`page_size=100`];

            if (finalSearchInput) params.push(`name__icontains=${encodeURIComponent(finalSearchInput)}`);
            if (selectedObservationType) params.push(`timeseries__observation_type__code=${encodeURIComponent(selectedObservationType.code)}`);

            // We flip the query for start and end to make sure that all cases of timeseries
            // with data are presented as discussed and agreed under this issue: "https://github.com/nens/lizard-catalogue/issues/220"
            if (start) params.push(`timeseries__end__gte=${moment(start).utc().format("YYYY-MM-DDTHH:mm:ss")}Z`);
            if (end && !timeValidator(start, end)) params.push(`timeseries__start__lte=${moment(end).utc().format("YYYY-MM-DDTHH:mm:ss")}Z`);

            const queries = params.join('&');

            // Recursive fetch action for locations with search queries
            recursiveFetchFunction(`/api/v4/monitoringnetworks/${selectedItem}/locations/?${queries}`, {}).then(
                (locationList: Location[]) => {
                    if (!locationList) return;
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
                        spatialBounds: getSpatialBounds(locationList),
                        centerPoint: locationList.length && !getSpatialBounds(locationList) && getGeometry(locationList[0]) ? getGeometry(locationList[0])!.coordinates : null,
                    });
                }
            );
        } else {
            // Remove state of filtered locations
            setFilteredLocationObject(null);
        };
    }, [selectedItem, finalSearchInput, selectedObservationType, start, end])

    // Add event listener to close modal on ESCAPE
    useEffect(() => {
        const closeModalOnEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeTimeseriesModal();
            };
        };
        if (!exportModal) window.addEventListener('keydown', closeModalOnEsc);
        return () => window.removeEventListener('keydown', closeModalOnEsc);
    });

    // useEffect to fetch timeseries when component first mounted
    // and remove timeseries when component unmounts
    useEffect(() => {
        // use AbortController instance to stop the recursive fetch timeseries function
        // when the TimeseriesModal component unmounted
        const controller = new AbortController();

        fetchTimeseries(selectedItem, controller.signal).then(response => {
            if (response && response.status === 'Error') {
                closeTimeseriesModal(); // close the modal if timeseries failed to load
            };
        });

        return () => {
            controller.abort();
            removeTimeseries();
        };

        // closeTimeseriesModal is excluded from the dependency array
        // as it caused the effect to be called multiple times
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem, fetchTimeseries, removeTimeseries]);

    if (!timeseriesObject || timeseriesObject.isFetching) return (
        <div className={`${modalStyles.ModalMain} ${modalStyles.ModalTimeseries} ${modalStyles.ModalTimeseriesLoading}`}>
            <MDSpinner size={100}  style={{ marginBottom: "20px" }}/>
            Loading Time Series for this Monitoring Network ...
        </div>
    );

    const { timeseries } = timeseriesObject;

    // Get list of timeseries nested in selected locations with observation type filter
    const getTimeseriesWithObservationTypeFilter = (timeseries: TimeSeries[]) => {
        return timeseries.filter(ts => {
            if (selectedObservationType) {
                return ts.observation_type.code === selectedObservationType.code;
            } else {
                return true;
            };
        });
    };

    // Helper function to select locations and timeseries in polygon
    const selectLocationsTimeseriesInPolygon = (locations: Location[]) => {
        const locationsInPolygon = locations.filter(
            location => location.geometry !== null
        ).filter(location =>
            // location with coordinates inside the polygon
            inside(location.geometry!.coordinates, polygon as [number, number][])
        ).map(
            location => location.uuid
        );

        const locationsInPolygonWithoutDuplicates = locationsInPolygon.filter(uuid =>
            // remove duplicates
            selectedLocations.indexOf(uuid) < 0
        );
        // Update the list of selected locations
        setSelectedLocations(selectedLocations.concat(locationsInPolygonWithoutDuplicates));

        // list of timeseries nested in the selected location
        const locationTimeseries = Object.values(timeseries).filter(ts => locationsInPolygon.includes(ts.location.uuid));

        // list of timeseries nested in the location with observation type filter
        const locationTimeseriesWithObservationTypeFilter = getTimeseriesWithObservationTypeFilter(locationTimeseries);

        const locationTimeseriesWithoutDuplicates = locationTimeseriesWithObservationTypeFilter.filter(ts => {
            const uuid = ts.uuid;
            const selectedTimeseriesUuid = selectedTimeseries.map(ts => ts.uuid);

            // remove duplicates from the selected timeseries list
            return !selectedTimeseriesUuid.includes(uuid);
        });
        // Update the list of selected timeseries
        setSelectedTimeseries((selectedTimeseries.concat(locationTimeseriesWithoutDuplicates)));
    };

    // Helper functions to get map bounds or center point
    const getMapBounds = () => {
        if (locationOnZoom || (filteredLocationObject && filteredLocationObject.centerPoint)) {
            return undefined;
        };
        if (filteredLocationObject && filteredLocationObject.spatialBounds) {
            return convertToLatLngBounds(filteredLocationObject.spatialBounds);
        };
        return convertToLatLngBounds(locationsObject.spatialBounds);
    };

    const getMapCenterPoint = () => {
        if (locationOnZoom) {
            return locations[locationOnZoom].geometry!.coordinates;
        };
        if (filteredLocationObject && filteredLocationObject.centerPoint) {
            return filteredLocationObject.centerPoint as [number, number];
        };
        return undefined;
    };

    return (
        <div className={`${modalStyles.ModalMain} ${modalStyles.ModalTimeseries}`}>
            <div className={modalStyles.ModalHeader}>
                <span>Select Time Series</span>
                <button onClick={closeTimeseriesModal}>&times;</button>
            </div>
            <div className={styles.Timeseries}>
                <div className={styles.TimeseriesFilter}>
                    <div className={styles.TimeseriesTop}>
                        <h3>1. SELECT LOCATIONS</h3>
                        <span className={styles.TimeseriesHelperText}>Select locations by clicking or select all locations with the same observation type</span>
                        <div className={styles.TimeseriesMap}>
                            <div className={styles.TimeseriesSearchLocation}>
                                <SearchBar
                                    name="searchBar"
                                    searchTerm={searchInput}
                                    title="Type name of locations"
                                    placeholder="Search for locations"
                                    onSearchChange={e => setSearchInput(e.currentTarget.value)}
                                    onSearchSubmit={e => {
                                        e.preventDefault();
                                        setFinalSearchInput(searchInput);
                                        setLocationOnZoom('');
                                    }}
                                />
                            </div>
                            {locationsObject.isFetching || (filteredLocationObject && filteredLocationObject.isFetching) ? (
                                <div className={mapStyles.MapLoading}>
                                    <MDSpinner />
                                </div>
                            ) : null}
                            <Map
                                ref={mapRef}
                                bounds={getMapBounds()}
                                center={getMapCenterPoint()}
                                zoom={getMapCenterPoint() ? 18 : undefined}
                                zoomControl={false}
                                attributionControl={false}
                                style={{
                                    height: '100%',
                                    opacity: locationsObject.isFetching || (filteredLocationObject && filteredLocationObject.isFetching) ? 0.4 : 1,
                                    cursor: drawingMode ? "default" : "pointer"
                                }}
                                onclick={(e: LeafletMouseEvent) => {
                                    if (drawingMode) {
                                        setPolygon([...polygon, [e.latlng.lat, e.latlng.lng]]);
                                    } else {
                                        polygon.length && setPolygon([]);
                                    };
                                }}
                            >
                                <ZoomControl position="bottomleft"/>
                                {polygon ? (
                                    <Polygon
                                        positions={polygon}
                                        color={"var(--main-color-scheme)"}
                                    />
                                ) : null}
                                {(filteredLocationUUIDs || locationUUIDs).map(locationUuid => {
                                    const location = locations[locationUuid];
                                    if (location.geometry) {
                                        return (
                                            <Marker
                                                key={location.uuid}
                                                position={location.geometry.coordinates}
                                                // @ts-ignore
                                                icon={new DivIcon({
                                                    iconSize: [24, 24],
                                                    tooltipAnchor: [12, 0],
                                                    className: selectedLocations.includes(locationUuid) ? `${styles.LocationIcon} ${styles.LocationIconSelected}` : styles.LocationIcon
                                                })}
                                                onClick={() => {
                                                    // list of timeseries nested in the location
                                                    const locationTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === locationUuid);

                                                    // list of timeseries nested in the location with observation type filter
                                                    const locationTimeseriesWithObservationTypeFilter = getTimeseriesWithObservationTypeFilter(locationTimeseries);

                                                    if (selectedLocations.includes(locationUuid)) { // to deselect location and all timeseries belong to the location
                                                        setSelectedLocations(selectedLocations.filter(uuid => uuid !== locationUuid));
                                                        setSelectedTimeseries(selectedTimeseries.filter(ts => {
                                                            return !locationTimeseries.find(locationTs => locationTs.uuid === ts.uuid);
                                                        }));
                                                    } else { // to select new location and timeseries with observation type filter
                                                        setSelectedLocations([...selectedLocations, locationUuid]);
                                                        setSelectedTimeseries([...selectedTimeseries, ...locationTimeseriesWithObservationTypeFilter]);
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
                            <button
                                className={`${buttonStyles.ButtonAction} ${buttonStyles.ButtonHomeZoom}`}
                                onClick={() => {
                                    // Remove location currently on zoom if any
                                    if (locationOnZoom) setLocationOnZoom('');
                                    // Set map to the original bounds
                                    mapRef && mapRef.current && mapRef.current.leafletElement.fitBounds(
                                        convertToLatLngBounds(filteredLocationObject && filteredLocationObject.spatialBounds ? filteredLocationObject.spatialBounds : locationsObject.spatialBounds)
                                    );
                                }}
                            >
                                <i className="fa fa-expand" />
                            </button>
                            {drawingMode ? (
                                <div className={styles.PolygonButtonContainer}>
                                    {/* Cancel polygon button */}
                                    <button
                                        className={`${buttonStyles.ButtonAction} ${buttonStyles.ButtonPolygon}`}
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
                                        className={`${buttonStyles.ButtonAction} ${buttonStyles.ButtonPolygon}`}
                                        onClick={() => setPolygon(polygon.slice(0, -1))}
                                        title="Re-draw"
                                        disabled={!polygon.length}
                                    >
                                        <i className="fa fa-repeat" />
                                    </button>
                                    {/* Confirm polygon button */}
                                    <button
                                        className={`${buttonStyles.ButtonAction} ${buttonStyles.ButtonPolygon}`}
                                        onClick={() => {
                                            if (filteredLocations) {
                                                selectLocationsTimeseriesInPolygon(Object.values(filteredLocations));
                                            } else {
                                                selectLocationsTimeseriesInPolygon(Object.values(locations));
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
                                <div className={styles.PolygonButtonContainer}>
                                    {/* Start drawing polygon button */}
                                    <button
                                        className={`${buttonStyles.ButtonAction} ${buttonStyles.ButtonPolygon}`}
                                        onClick={() => {
                                            setPolygon([]);
                                            setDrawingMode(true);
                                        }}
                                        title="Draw"
                                    >
                                        <img
                                            src={polygonIcon}
                                            alt="polygon"
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.TimeseriesFilterBar}>
                        <div className={styles.TimeseriesFilterObservationType}>
                            <h3>FILTER OBSERVATION TYPE</h3>
                            <form>
                                <Dropdown
                                    placeholder={'- Search and select -'}
                                    options={observationTypes.map(obsT => convertToSelectObject(obsT.id, obsT.parameter || obsT.code, obsT))}
                                    value={selectedObservationType ? convertToSelectObject(selectedObservationType.id, selectedObservationType.parameter || selectedObservationType.code, selectedObservationType) : null}
                                    onChange={(e) => setSelectedObservationType(e as ObservationType | null)}
                                    dropUp={true}
                                />
                            </form>
                        </div>
                        <div className={styles.TimeseriesFilterPeriod}>
                            <h3>FILTER PERIOD</h3>
                            <TimeseriesPeriodFilter
                                start={start}
                                end={end}
                                setStart={setStart}
                                setEnd={setEnd}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.TimeseriesSelection}>
                    <div className={styles.TimeseriesTop}>
                        <div className={styles.TimeseriesSelectedLocations}>
                            <div className={styles.TimeseriesSelectedLocationsHeader}>
                                <div>
                                    <h3>2. SELECTED TIME SERIES</h3>
                                    <span className={styles.TimeseriesHelperText}>The selected time-series will appear here</span>
                                </div>
                                <button
                                    className={buttonStyles.ButtonAction}
                                    style={{
                                        fontSize: 16,
                                        width: 'auto'
                                    }}
                                    onClick={() => {
                                        setSelectedLocations([]);
                                        setSelectedTimeseries([]);
                                    }}
                                    disabled={!selectedTimeseries.length}
                                    title="Clear selection"
                                >
                                    CLEAR SELECTION
                                </button>
                            </div>
                            <ul className={styles.TimeseriesLocationList} id="scrollbar">
                                {selectedTimeseries.map(ts => {
                                    // location name and location code are not available in the timeseries endpoint on production
                                    // so we cannot retrieve these infos directly from the ts.location.code and ts.location.name
                                    // but to look for the location that we stored in the Redux store by its UUID
                                    const location = locations[ts.location.uuid];
                                    return (
                                        <li key={ts.uuid}>
                                            <span
                                                className={styles.TimeseriesLocationName}
                                                title={"Click to zoom into the location"}
                                                onClick={() => setLocationOnZoom(ts.location.uuid)}
                                            >
                                                {location.name} ({location.code}) [{ts.name}] [{ts.observation_type.parameter}]
                                            </span>
                                            <button
                                                className={buttonStyles.ButtonDeselect}
                                                onClick={() => {
                                                    const locationOfTheTimeseries = ts.location.uuid;
                                                    const selectedTimeseriesInThisLocation = selectedTimeseries.filter(ts => ts.location.uuid === locationOfTheTimeseries);
                                                    if (selectedTimeseriesInThisLocation.length === 1) {
                                                        // also remove the currently selected location if this is the last timeseries to be removed
                                                        setSelectedLocations(selectedLocations.filter(locationUuid => ts.location.uuid !== locationUuid))
                                                    };
                                                    setSelectedTimeseries(selectedTimeseries.filter(t => t.uuid !== ts.uuid));
                                                }}
                                            >
                                                <i className={`fa fa-minus-square-o ${buttonStyles.IconDeselect}`} />
                                                <i className={`fa fa-minus-square ${buttonStyles.IconDeselect} ${buttonStyles.IconDeselect__OnHover}`} />
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className={styles.TimeseriesButtonContainer}>
                        <h3>3. ACTIONS FOR YOUR SELECTIONS</h3>
                        <div>
                            <div className={styles.TimeseriesButtons}>
                                <button
                                    className={buttonStyles.ButtonAction}
                                    title="Open in API"
                                    onClick={() => openTimeseriesInAPI(selectedTimeseries.map(ts => ts.uuid))}
                                    disabled={!selectedTimeseries.length}
                                >
                                    OPEN IN API
                                </button>
                                <button className={buttonStyles.ButtonAction} style={{ visibility: "hidden" }} />
                            </div>
                            <div className={styles.TimeseriesButtons}>
                                <button
                                    className={buttonStyles.ButtonAction}
                                    title="Open in Portal"
                                    onClick={async () => {
                                        const arrayOfLocations = selectedLocations.map(uuid => locations[uuid]);
                                        return await openLocationsInLizard(arrayOfLocations, start, end);
                                    }}
                                    disabled={!selectedLocations.length}
                                >
                                    OPEN IN VIEWER
                                </button>
                                <button
                                    className={buttonStyles.ButtonAction}
                                    title={
                                        !selectedTimeseries.length ? 'Please select Time Series to export' :
                                        timeValidator(start, end) ? timeValidator(start, end) as string :
                                        'Export Time Series'
                                    }
                                    onClick={() => setExportModal(true)}
                                    disabled={!selectedTimeseries.length || !!timeValidator(start, end)}
                                >
                                    EXPORT TIME SERIES
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*This is the PopUp window for the time-series export modal*/}
            {exportModal && (
                <div className={modalStyles.ModalBackground}>
                    <TimeSeriesExportModal
                        defaultStart={start}
                        defaultEnd={end}
                        selectedTimeseries={selectedTimeseries.map(ts => ts.uuid)}
                        toggleModal={() => setExportModal(!exportModal)}
                    />
                </div>
            )}
        </div>
    );
};

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    fetchTimeseries: (uuid: string, signal?: AbortSignal) => dispatch(fetchTimeseries(uuid, signal)),
    removeTimeseries: () => dispatch(removeTimeseries()),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(TimeSeriesModal);