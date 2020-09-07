import React, { useState } from 'react';
import MDSpinner from "react-md-spinner";
import { useSelector } from 'react-redux';
import Leaflet from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import {
    getLocationsObject,
    getSelectedItem,
    getAllMonitoringNetworks,
    getMonitoringNetworkObservationTypes,
} from '../../reducers';
import { MonitoringNetwork, ObservationType } from '../../interface';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import TimeSeriesModal from '../components/TimeSeriesModal';
import '../styles/Details.css';
import '../styles/Buttons.css';
import '../styles/Modal.css';

// Helper function to add reference frame to unit of observation type
const addRefToUnit = (observationType: ObservationType) => {
    return observationType.reference_frame ? observationType.unit + observationType.reference_frame : observationType.unit;
};

const MonitoringNetworkDetails: React.FC = () => {
    const selectedItem = useSelector(getSelectedItem);
    const allMonitoringNetworks = useSelector(getAllMonitoringNetworks);
    const monitoringNetwork = allMonitoringNetworks[selectedItem] as MonitoringNetwork;
    const observationTypeObject = useSelector(getMonitoringNetworkObservationTypes);
    const locationsObject = useSelector(getLocationsObject);

    const [timeseriesModal, setTimeseriesModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'Details' | 'Actions'>('Details');

    if (!monitoringNetwork) return <div className="details details-loading">Please select a monitoring network</div>;

    return (
        <div className="details">
            <div className="details-name">
                <h3 title={monitoringNetwork.name}>
                    {monitoringNetwork.name}
                </h3>
            </div>
                <div className="details-uuid">
                    <span>{monitoringNetwork.uuid}</span>
                    <button
                        className="button-tooltip"
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
                <span className="description">{monitoringNetwork.description}</span>
            </div>
            <div className="details-info">
                <span className="details-title">Organisation</span>
                <span>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</span>
            </div>
            <table className="details-table" cellSpacing={0}>
                <tbody>
                    <tr>
                        <th
                            className={activeTab === 'Details' ? 'details-table-selected' : ''}
                            onClick={() => setActiveTab('Details')}
                        >
                            Details
                        </th>
                        <th
                            className={activeTab === 'Actions' ? 'details-table-selected' : ''}
                            onClick={() => setActiveTab('Actions')}
                        >
                            Actions
                        </th>
                    </tr>
                    <tr className="details-table-empty-row"><td /></tr>
                    {activeTab === 'Details' && observationTypeObject ? (
                        <tr>
                            <td>Observation types</td>
                            {observationTypeObject.isFetching ? (
                                <td style={{ textAlign: 'center' }}>
                                    <MDSpinner />
                                </td>
                            ) : (
                                <td>
                                    {observationTypeObject.observationTypes.map(observationType => (
                                        <p key={observationType.id}>{observationType.parameter ? observationType.parameter : observationType.code} ({addRefToUnit(observationType)})</p>
                                    ))}
                                </td>
                            )}
                        </tr>
                    ) : (
                        <tr>
                            <td />
                            <td>
                                <button
                                    className="button-action"
                                    onClick={() => setTimeseriesModal(!timeseriesModal)}
                                >
                                    SELECT TIME SERIES
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/*This is the PopUp window for the time series selection screen*/}
            {timeseriesModal && (
                <div className="modal-background">
                    <TimeSeriesModal
                        toggleTimeseriesModal={() => setTimeseriesModal(!timeseriesModal)}
                    />
                </div>
            )}
        </div>
    )
}

export default MonitoringNetworkDetails;