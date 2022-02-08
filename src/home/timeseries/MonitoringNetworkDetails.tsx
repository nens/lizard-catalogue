import { Fragment, useEffect, useState } from 'react';
import MDSpinner from "react-md-spinner";
import { useSelector } from 'react-redux';
import { DivIcon } from 'leaflet';
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
import { convertToLatLngBounds } from '../../utils/latLngZoomCalculation';
import { ObservationType, TableTab } from '../../interface';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import TimeSeriesModal from '../../components/TimeSeriesModal';
import Action from '../../components/Action';
import manageIcon from '../../images/manage.svg';
import styles from '../../styles/Details.module.css';
import modalStyles from '../../styles/Modal.module.css';
import timeseriesModalStyles from '../../components/TimeseriesModal.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import filterOptionStyles from '../../components/FilterOption.module.css';

// Helper function to add reference frame to unit of observation type
const addRefToUnit = (observationType: ObservationType) => {
    return observationType.reference_frame ? observationType.unit + observationType.reference_frame : observationType.unit;
};

const MonitoringNetworkDetails = () => {
    const selectedItem = useSelector(getSelectedItem);
    const monitoringNetwork = useSelector((state: MyStore) => getMonitoringNetwork(state, selectedItem));
    const observationTypeObject = useSelector(getMonitoringNetworkObservationTypes);
    const locationsObject = useSelector(getLocationsObject);
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;
    const bounds = convertToLatLngBounds(locationsObject ? locationsObject.spatialBounds : null);

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

    if (!monitoringNetwork) return <div className={`${styles.Details} ${styles.DetailsText}`}>Please select a monitoring network</div>;

    return (
        <div
            className={styles.Details}
            style={{
                gridTemplateRows: "6rem 20rem auto 4rem 4rem 1fr"
            }}
        >
            <div className={styles.NameUuidContainer}>
                <div className={styles.Name}>
                    <h3 title={monitoringNetwork.name}>
                        {monitoringNetwork.name}
                    </h3>
                    {authorizedToManageLayer ? (
                        <img
                            className={styles.ManageIcon}
                            src={manageIcon}
                            title='To manage this network'
                            alt="Manage"
                            onClick={() => window.open(`/management/data_management/timeseries/monitoring_networks/${monitoringNetwork.uuid}`)}
                        />
                    ) : null}
                </div>
                <div className={styles.Uuid}>
                    <div title={monitoringNetwork.uuid}>{monitoringNetwork.uuid}</div>
                    <button
                        className={buttonStyles.ButtonCopy}
                        onClick={() => navigator.clipboard.writeText(monitoringNetwork.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
            </div>
            <div className={styles.Map}>
                {locationsObject && locationsObject.isFetching ? (
                    <div className={styles.MapLoading}>
                        <MDSpinner />
                    </div>
                ) : null}
                <Map
                    bounds={bounds}
                    zoomControl={false}
                    style={{
                        width: '100%',
                        opacity: locationsObject && locationsObject.isFetching ? 0.4 : 1
                    }}
                >
                    {locationsObject && Object.values(locationsObject.locations).map(location => {
                        if (location.geometry) {
                            return (
                                <Marker
                                    key={location.uuid}
                                    position={location.geometry.coordinates}
                                    // @ts-ignore
                                    icon={new DivIcon({
                                        iconSize: [16, 16],
                                        className: `${timeseriesModalStyles.LocationIcon} ${timeseriesModalStyles.LocationIconSmall}`
                                    })}
                                />
                            )
                        };
                        return null;
                    })}
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                </Map>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Description</span>
                <span className={styles.InfoBoxDescription} id="scrollbar">{monitoringNetwork.description}</span>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Organisation</span>
                <span>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</span>
            </div>
            <div className={`${styles.Grid} ${styles.GridHeader}`}>
                <div
                    className={activeTab === 'Details' ? styles.GridHeaderSelected : ''}
                    onClick={() => setActiveTab('Details')}
                >
                    Details
                </div>
                <div
                    className={activeTab === 'Actions' ? styles.GridHeaderSelected : ''}
                    onClick={() => setActiveTab('Actions')}
                >
                    Actions
                </div>
            </div>
            {activeTab === 'Details' && observationTypeObject ? (
                observationTypeObject.isFetching ? (
                    <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyDetails}`}>
                        <div>Observation types</div>
                        <div style={{ textAlign: 'center' }}>
                            <MDSpinner size={24} />
                        </div>
                    </div>
                ): (
                    <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyDetails}`} id='scrollbar'>
                        <div>Observation types</div>
                        {observationTypeObject.observationTypes.map((observationType, i) => {
                            // Only show first 10 observation types in the table
                            if (i < 10) {
                                return (
                                    <Fragment key={i}>
                                    <div>{observationType.parameter ? observationType.parameter : observationType.code} {observationType.unit ? `(${addRefToUnit(observationType)})` : null}</div>
                                    <div />
                                    </Fragment>
                                )
                            } else {
                                return null;
                            }
                        })}
                        {observationTypeObject.count > 10 ? (
                            <div
                                className={filterOptionStyles.FilterListButton}
                                style={{ cursor: 'default' }}
                            >
                                {observationTypeObject.count - 10} more
                            </div>
                        ) : null}
                    </div>
                )
            ) : (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyActions}`} id='scrollbar'>
                    <Action
                        title='Select time series'
                        description='Open the time series selection modal to select and export time series'
                        tooltip='Open the Time Series selection modal'
                        onClick={() => setTimeseriesModal(!timeseriesModal)}
                    />
                </div>
            )}
            {/*This is the PopUp window for the time-series selection screen*/}
            {timeseriesModal && (
                <div className={modalStyles.ModalBackground}>
                    <TimeSeriesModal
                        closeTimeseriesModal={() => setTimeseriesModal(false)}
                    />
                </div>
            )}
        </div>
    )
}

export default MonitoringNetworkDetails;