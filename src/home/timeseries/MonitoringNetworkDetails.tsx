import React, { useEffect, useState } from 'react';
import MDSpinner from "react-md-spinner";
import { useSelector } from 'react-redux';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import {
    getLocationsObject,
    getSelectedItem,
    getMonitoringNetwork,
    getMonitoringNetworkObservationTypes,
    getOrganisations,
    getLizardBootstrap,
    MyStore,
} from '../../reducers';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { MonitoringNetwork, ObservationType, TableTab } from '../../interface';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import TimeSeriesModal from '../../components/TimeSeriesModal';
import Action from '../../components/Action';
import manageIcon from '../../images/manage.svg';
import '../../styles/Details.css';
import '../../styles/Buttons.css';
import '../../styles/Modal.css';

// Helper function to add reference frame to unit of observation type
const addRefToUnit = (observationType: ObservationType) => {
    return observationType.reference_frame ? observationType.unit + observationType.reference_frame : observationType.unit;
};

const MonitoringNetworkDetails = () => {
    const selectedItem = useSelector(getSelectedItem);
    const monitoringNetwork = useSelector((state: MyStore) => getMonitoringNetwork(state, selectedItem)) as MonitoringNetwork;
    const observationTypeObject = useSelector(getMonitoringNetworkObservationTypes);
    const locationsObject = useSelector(getLocationsObject);
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;

    const [timeseriesModal, setTimeseriesModal] = useState(false);
    const [activeTab, setActiveTab] = useState<TableTab>('Details');
    const [authorizedToManageLayer, setAuthorizedToManageLayer] = useState<boolean>(false);

    useEffect(() => {
        if (monitoringNetwork && user) {
            const authorized = isAuthorizedToManageLayer(monitoringNetwork, user.username, organisations);
            setAuthorizedToManageLayer(authorized);
        };
        return () => setAuthorizedToManageLayer(false);
    }, [monitoringNetwork, user, organisations]);

    if (!monitoringNetwork) return <div className="details details-loading">Please select a monitoring network</div>;

    return (
        <div className="details" id="scrollbar">
            <div className="details-name">
                <h3 title={monitoringNetwork.name}>
                    {monitoringNetwork.name}
                </h3>
                <span title="To manage this network">
                    {authorizedToManageLayer ? (
                        <a
                            href={`/management/data_management/timeseries/monitoring_networks/${monitoringNetwork.uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className="details-manage-icon"
                                src={manageIcon}
                                alt="View in manage client"
                            />
                        </a>
                    ) : null}
                </span>
            </div>
                <div className="details-uuid">
                    <span>{monitoringNetwork.uuid}</span>
                    <button
                        className="button-copy"
                        onClick={() => navigator.clipboard.writeText(monitoringNetwork.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
            <div className="details-map">
                {locationsObject && locationsObject.isFetching ? (
                    <div className="details-map-loading">
                        <MDSpinner />
                    </div>
                ) : null}
                <Map
                    bounds={locationsObject ? locationsObject.spatialBounds : [[85, 180], [-85, -180]]}
                    zoomControl={false}
                    style={{
                        opacity: locationsObject && locationsObject.isFetching ? 0.4 : 1
                    }}
                >
                    {locationsObject && Object.values(locationsObject.locations).map(location => {
                        if (location.geometry) {
                            return (
                                <Marker
                                    key={location.uuid}
                                    position={location.geometry.coordinates}
                                    icon={new Leaflet.DivIcon({
                                        iconSize: [16, 16],
                                        className: "location-icon location-icon-small"
                                    })}
                                />
                            )
                        };
                        return null;
                    })}
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                </Map>
            </div>
            <div className="details-info">
                <span className="details-title">Description</span>
                <span className="description" id="scrollbar">{monitoringNetwork.description}</span>
            </div>
            <div className="details-info">
                <span className="details-title">Organisation</span>
                <span>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</span>
            </div>
            <div className="details-grid details-grid-header">
                <div
                    className={activeTab === 'Details' ? 'details-grid-header-selected' : ''}
                    onClick={() => setActiveTab('Details')}
                >
                    Details
                </div>
                <div
                    className={activeTab === 'Actions' ? 'details-grid-header-selected' : ''}
                    onClick={() => setActiveTab('Actions')}
                >
                    Actions
                </div>
            </div>
            {activeTab === 'Details' && observationTypeObject ? (
                observationTypeObject.isFetching ? (
                    <div className="details-grid details-grid-body">
                        <div>Observation types</div>
                        <div style={{ textAlign: 'center' }}>
                            <MDSpinner size={24} />
                        </div>
                    </div>
                ): (
                    <div className="details-grid details-grid-body details-grid-body-details">
                        <div>Observation types</div>
                        {observationTypeObject.observationTypes.map((observationType, i) => {
                            // Only show first 10 observation types in the table
                            if (i < 10) {
                                return (
                                    <React.Fragment key={i}>
                                    <div>{observationType.parameter ? observationType.parameter : observationType.code} {observationType.unit ? `(${addRefToUnit(observationType)})` : null}</div>
                                    <div />
                                    </React.Fragment>
                                )
                            } else {
                                return null;
                            }
                        })}
                        {observationTypeObject.count > 10 ? (
                            <div
                                className="filter-list-button"
                                style={{ cursor: 'default' }}
                            >
                                {observationTypeObject.count - 10} more
                            </div>
                        ) : null}
                    </div>
                )
            ) : (
                <div className="details-grid details-grid-body details-grid-actions">
                    <Action
                        title='Select time series'
                        description='Open the time series selection modal to select and export selected time series'
                        tooltip='Open the Time Series selection modal'
                        onClick={() => setTimeseriesModal(!timeseriesModal)}
                    />
                </div>
            )}
            {/*This is the PopUp window for the time-series selection screen*/}
            {timeseriesModal && (
                <div className="modal-background">
                    <TimeSeriesModal
                        closeTimeseriesModal={() => setTimeseriesModal(false)}
                    />
                </div>
            )}
        </div>
    )
}

export default MonitoringNetworkDetails;